# Tres fallos vistos en producción: electro congelado, spoiler en "retirado", y el hueco de "nueva partida"

**Fecha:** 2026-08-09 00:29
**Tipo:** Fix / Feature

## Qué se hizo

1. **El electro se congelaba al cambiar de pestaña, y al volver saltaba hacia atrás.**
   Reportado como "el ping ahora ocurre cada 11 seg o más, y las ondas van a
   trompicones". Verificado en vivo contra `elpaciente.es`: con la pestaña en segundo
   plano, `animation.currentTime` se queda clavado — se muestreó 27 segundos seguidos sin
   avanzar ni un milisegundo, con `document.hidden === true`. El navegador congela la
   animación WAAPI y deja de llamar a `requestAnimationFrame` mientras la pestaña no es
   visible. El código "preservaba la fase" leyendo ese reloj congelado al volver, lo cual
   no tiene sentido (el tiempo real transcurrido no está en ningún sitio) y era justo lo
   que producía el salto hacia atrás y el bip espaciado. Es la misma familia de bug que ya
   se arregló una vez en `useAiReveal.ts`, nunca aplicada aquí.

   Arreglo: un listener de `visibilitychange` que, al volver a ser visible, cancela la
   animación y arranca una limpia en fase 0, sin intentar preservar una fase que ya no
   significa nada. Verificado disparando el evento real: la animación vieja se cancela y
   nace una nueva sin duplicarse (sigue habiendo exactamente 1).

2. **"Nueva partida" mostraba el secreto — un spoiler.** El tipo `BrainRoundEnd.secret`
   era obligatorio y el agente lo mandaba siempre, para los tres desenlaces. Pero
   `retirado` significa que nadie lo ha ganado: mostrarlo ahí regala la respuesta gratis, y
   encima de una ronda que puede volver a salir más adelante (el repertorio rota sobre 5).
   Contradecía además una invariante ya documentada en el README ("el secreto nunca sale
   de ese proceso hasta que alguien lo gana").

   `secret` pasa a opcional, y el agente solo lo manda en `revelado` y `paro`. La UI
   (`RoundOverlay`, `diploma.ts`) deja de asumir que siempre está: si no viene, no se
   dibuja la cita, y el resto del layout sube para no dejar un hueco vacío. Verificado con
   los tres desenlaces vía `preview.tsx?fin=...` (nuevo, para poder revisarlos sin gastar
   cuota de Portal) — incluida la imagen descargable.

3. **El hueco entre confirmar "nueva partida" y que pase algo en pantalla.** La petición
   viaja hasta el agente y vuelve; hasta ahora no había ninguna señal entre el clic y el
   marcador de desenlace, y se sentía como que la web se había quedado colgada. Nuevo
   `NewGameLoading`: un aviso breve con fondo desenfocado, en el mismo lenguaje visual que
   `RoundOverlay`. Se cierra en cuanto llega el desenlace real, o con un techo de 6 s si el
   agente rechaza la petición (ese caso se explica solo con el aviso del sistema en el
   chat, que sigue llegando igual). No es carga optimista de verdad — no asume que la
   petición vaya a aceptarse — solo dice "esto se está moviendo" en vez de dejar la
   pantalla muda.

## Qué se modificó

- `apps/web/src/components/Monitor.tsx` — `visibilitychange` en el efecto del electro.
- `packages/shared/src/types.ts` — `BrainRoundEnd.secret` pasa a opcional.
- `apps/agent/src/index.ts` — `endRound` no manda el secreto en `retirado`.
- `apps/web/src/components/RoundOverlay.tsx` — cita del secreto condicional.
- `apps/web/src/lib/diploma.ts` — ídem, con el layout reajustado sin ella.
- `apps/web/src/components/NewGameLoading.tsx` (nuevo).
- `apps/web/src/App.tsx` — estado y cableado del aviso de carga.
- `apps/web/src/preview.tsx` — `?fin=revelado|paro|retirado` y `?cargando=1`, para poder
  revisar los tres desenlaces y el aviso de carga sin tocar la sala compartida.
- `docs/data-model.md` — `secret` documentado como opcional, con el porqué.

## Por qué

Los tres, reportados por el usuario tras probar `elpaciente.es` ya desplegado y en uso por
visitantes reales. El segundo es el más serio: no es solo estética, rompe una garantía de
producto ya documentada. Se verificó todo contra el sitio real o vía `preview.tsx` — no se
tocó el estado de la sala compartida en ningún momento, porque podía haber alguien jugando.
