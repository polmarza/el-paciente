# El paciente ignoraba las preguntas coincidentes con una edición, y el arranque dejó de adivinar

**Fecha:** 2026-08-08 20:32
**Tipo:** Fix

## Qué se hizo

1. **El paciente se comía las preguntas hechas a la vez que una edición.** Reportado en vivo
   por el usuario: preguntaba algo directo ("¿qué número es tu habitación?") y el paciente
   respondía en bucle con meta-comentarios sobre la edición, sin contestar nunca. Causa:
   `buildTurn` (`apps/agent/src/prompt.ts`) añadía siempre, tras una edición, la instrucción
   "reacciona a lo que acabas de sentir, **sin que nadie te haya preguntado nada**" — pero
   Portal agrupa una pregunta y una edición hechas casi a la vez en un solo turno (ventana
   de 1.2s), así que esa frase le mentía al modelo justo cuando SÍ había una pregunta
   pendiente, y el turno entero se iba en la edición. Ahora `buildTurn` comprueba si el
   último mensaje del chat es humano y, si lo es, reformula el aviso para que conteste la
   pregunta primero y dé la edición como matiz, no como desvío. Tres pruebas nuevas en
   `prompt.test.ts` fijan el comportamiento en los tres casos (pregunta pendiente, reacción
   espontánea, sin chat previo).

2. **El arranque del agente podía sembrar una ronda nueva encima de una partida en curso.**
   Efecto colateral descubierto al desplegar el fix anterior: `bootstrap()` decidía si la
   sala estaba "virgen" tras un temporizador fijo de 2.5s, adivinando que el backfill de
   Portal ya habría llegado. Si tardaba más — como pasó en producción, borrando una partida
   real a mitad de ronda —, el agente encontraba el canal `brain` vacío y sembraba desde
   cero. Se sustituyó el temporizador por una espera real a la señal `status === "ready"`
   del canal (con un techo de 8s como backstop, no como mecanismo principal), que es la
   confirmación que da Portal de que el backfill ya llegó.

   Nota abierta: incluso con este arreglo, dos reinicios seguidos en el mismo incidente
   vieron `status: "ready"` con 0 mensajes en el canal `brain`, pese a llevar toda la
   sesión funcionando con la misma clave. Eso ya no es una carrera de tiempos — el canal
   volvía vacío de verdad —, y no hay forma de diagnosticarlo desde este lado (el CLI de
   Portal no tiene un comando para listar histórico, solo `listen` en vivo). Pendiente de
   revisar en el dashboard de useportal.co si se repite.

## Qué se modificó

- `apps/agent/src/prompt.ts` — `buildTurn` distingue pregunta pendiente vs. reacción
  espontánea al construir el turno posterior a una edición.
- `apps/agent/src/prompt.test.ts` (nuevo) — fija los tres casos.
- `apps/agent/src/index.ts` — `waitReady()` sustituye a `BOOT_GRACE_MS`; `BOOT_TIMEOUT_MS`
  como techo de seguridad, no como mecanismo principal.

## Por qué

El usuario reportó una conversación real donde el paciente entraba en bucle de episodios
sin responder nunca a lo que le preguntaban, y preguntó explícitamente si el agente estaba
ignorando el chat. Diagnóstico confirmado leyendo el código de construcción del prompt, no
solo el síntoma.
