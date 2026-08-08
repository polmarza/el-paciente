# El indicador de "pensando" deja de mentir

**Fecha:** 2026-08-08 04:56
**Tipo:** Feature

## Qué se hizo

El aviso "EL PACIENTE está escribiendo…" era una deducción del cliente: se encendía si el
último mensaje era humano y tenía menos de 20 segundos. Se veía exactamente igual con el
agente caído, y de hecho dio una pista falsa durante una sesión de depuración real: parecía
que el paciente pensaba cuando en realidad no había ningún agente escuchando.

Ahora la señal la emite quien la sabe:

- El agente llama a `sendActivity("thinking")` al empezar un turno y la reanuncia cada 2 s
  mientras dure, cortándola en el `finally` — así también se apaga si el turno falla.
- La web lee `activity` del canal y enciende el aviso solo si hay una entrada de ese tipo.
  El público emite `"typing"` y solo el agente emite `"thinking"`, así que distinguirlos por
  el tipo basta.
- La etiqueta y el intervalo viven en `packages/shared` (`ACTIVITY_THINKING`,
  `THINKING_HEARTBEAT_MS`), para que agente y web no puedan divergir.
- El texto pasa a "EL PACIENTE está pensando…", que es lo que de verdad está haciendo.

## Verificación en vivo

- Con el agente en marcha: el indicador se enciende al enviar y se apaga al llegar la
  respuesta, cubriendo el turno (≈1,5 s en la medición).
- **Con el agente apagado: permanece apagado.** Comprobado 21 segundos después de enviar un
  mensaje, sin respuesta y sin aviso. Es justo el caso que antes mentía.

## Qué se modificó

- `apps/agent/src/index.ts` (`announceThinking`)
- `apps/web/src/hooks/useChat.ts` (`patientThinking` desde `activity`)
- `apps/web/src/components/ChatPane.tsx` (fuera la heurística)
- `apps/web/src/App.tsx`, `apps/web/src/preview.tsx`
- `packages/shared/src/constants.ts`

## Riesgo detectado de paso

Levantar `pnpm agent` dos veces deja dos agentes escuchando, y **cada uno responde**: EL
PACIENTE se contesta a sí mismo por duplicado. Ocurrió durante esta sesión (llegó a haber
tres procesos vivos a la vez). No hay guardia de instancia única. Anotado como MEJORA-03.
