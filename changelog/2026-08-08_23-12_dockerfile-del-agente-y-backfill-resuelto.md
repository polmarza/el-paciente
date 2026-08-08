# Dockerfile del agente 24/7 y el misterio del canal vacío, resuelto

**Fecha:** 2026-08-08 23:12
**Tipo:** Feature / Fix

## Qué se hizo

1. **El agente puede correr 24/7 en un contenedor.** El usuario quiere que
   `elpaciente.es` sea jugable en cualquier momento, no solo cuando su portátil tenga
   `pnpm agent` abierto — y el agente no puede vivir en Vercel (la web es estática; el
   agente es un proceso de larga duración con un WebSocket abierto). Nuevo `Dockerfile` en
   la raíz que empaqueta SOLO el agente (Node 22 + type stripping, sin paso de build), con
   `.dockerignore` que además blinda los `.env*` fuera del contexto. Sin puertos expuestos
   (el agente solo abre conexiones salientes) y pensado para UNA réplica: el cerrojo de
   instancia única es un PID local, y dos agentes responden por duplicado.

   Verificado con Docker local: build limpia, sin credenciales muere con el error de
   validación esperado, y con credenciales conecta y se reincorpora a la ronda en curso.

2. **Resuelto el misterio del "canal vacío" en el arranque.** Dos reinicios del incidente
   anterior y la primera prueba del contenedor vieron `status: "ready"` con 0 mensajes en
   una sala con partida en curso, y sembraron encima. La causa, confirmada en vivo: Portal
   emite `ready` un instante ANTES de volcar el backfill en `channel.messages`. El
   navegador nunca lo sufrió porque React repinta cuando los mensajes llegan; el agente
   leía una sola vez, justo en el hueco. Arreglo: tras `ready`, `waitBackfill()` sondea el
   almacén (200 ms, techo de 5 s) hasta que aparezca algún mensaje; solo entonces se decide
   si la sala está virgen. Una sala virgen de verdad paga ese techo una única vez en su
   vida. Verificado: tres reinicios seguidos (dos locales, uno en contenedor) se
   reincorporan a la ronda en vez de sembrar.

## Qué se modificó

- `Dockerfile` (nuevo), `.dockerignore` (nuevo)
- `apps/agent/src/index.ts` — `waitBackfill()` tras `waitReady()` en el arranque
- `docs/architecture.md` — estrategia de despliegue: dos modos del agente, y el porqué
- `docs/roadmap.md` — el punto de vigilancia del arranque pasa a resuelto; nuevo pendiente
  de crear el servicio en la plataforma
- `README.md` — sección "Despliegue"
- `CLAUDE.md` — línea de despliegue del stack

## Por qué

El usuario decidió que la web pública debe ser jugable en cualquier momento, lo que
convierte el "agente local en la máquina de la demo" en insuficiente. Y de camino, la
prueba del contenedor reprodujo el bug de arranque pendiente de explicación y dio la pista
definitiva para cerrarlo — era condición necesaria para un worker remoto, donde la
plataforma reinicia el proceso cuando quiere.
