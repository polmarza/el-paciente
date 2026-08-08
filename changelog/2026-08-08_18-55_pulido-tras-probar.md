# Pulido tras probarlo: onboarding en 3 pasos, chat alineado, toasts visibles

**Fecha:** 2026-08-08 18:55
**Tipo:** Fix

## Qué se hizo

Cinco ajustes de la primera sesión de uso real tras el feedback de mentoría.

- **Onboarding en 3 pasos + nombre**: objetivo → mesa → final. Los dos dibujos de la mente
  (rejilla y bisturí) se fusionan en uno, y el juego se cuenta ANTES que la mecánica —
  primero por qué jugar, luego cómo.
- **Sonido más audible**: los volúmenes suben al doble (el tecleo estaba sintetizado a un
  pico de ~0,03: prácticamente inaudible), fallback a `webkitAudioContext`, desbloqueo
  también por teclado, y **el botón ♪ reproduce un ping al reactivar** — confirmación
  inmediata de que el audio funciona en ese navegador. Verificado con render offline que
  la síntesis produce señal (pico 0,218 el ping) y que el contexto arranca en `running`.
- **Chat como un chat**: los mensajes humanos salen por la derecha en su propia burbuja
  (nombre arriba, texto debajo); el paciente sigue entrando por la izquierda.
- **Botón ↵ en el pasillo**, dentro del área del input.
- **Toasts anclados abajo a la derecha**, con borde izquierdo grueso y sombra — centrados
  sobre el composer se camuflaban y nadie los veía. Las pistas usan ✱ y los rechazos ▲, y
  hay un **interruptor ✱ en la cabecera** para desactivar las pistas (los avisos de rechazo
  no se desactivan: son la respuesta a algo que acabas de hacer).

## Verificación en vivo

Onboarding recorrido (3 pasos + nombre), mensajes humanos a la derecha, botón ↵ presente,
y el toast de cooldown capturado con su posición medida (anclado al borde derecho).

Durante la prueba se observó la limitación ya documentada de los cooldowns: dos ediciones
seguidas del mismo usuario pasaron — el estado en memoria del middleware vive por instancia
y Portal repartió las invocaciones. Sigue siendo defensa anti-gamberro, no de seguridad;
está anotado en architecture.md desde el día 1.

## Qué se modificó

- `apps/web/src/components/`: `Onboarding.tsx`, `ChatPane.tsx`, `PasilloPane.tsx`,
  `Toast.tsx`, `Monitor.tsx`
- `apps/web/src/lib/`: `sound.ts`, `hints.ts` (nuevo)
- `apps/web/src/App.tsx`, `styles.css`
