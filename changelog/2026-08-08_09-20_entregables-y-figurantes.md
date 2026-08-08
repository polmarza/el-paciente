# Entregables del hackathon y figurantes para la grabación

**Fecha:** 2026-08-08 09:20
**Tipo:** Documentación

## Qué se hizo

`docs/entregables.md` con los tres entregables: el pitch (tres versiones, todas por debajo
de 280 caracteres), la escaleta del vídeo con tiempos, y la explicación de cómo se usó Portal.

`apps/agent/src/extras.ts` (`pnpm extras`): levanta tres clientes de Portal con identidades
anónimas independientes y ejecuta una coreografía con tiempos — deliberan en el pasillo,
tantean al paciente, posan cursores sobre las regiones y le editan la mente.

Es andamiaje de grabación, no producto: se lanza a mano y no lo arranca nada más. Usa los
mismos canales, el mismo middleware y los mismos cooldowns que cualquier navegador.

## Verificación

- Los tres figurantes reciben identidades distintas de Portal (`anon_2YRNDjX`, `anon__7qrDq_`,
  `anon_f4T2Nxu`). Era el punto que podía tumbarlo: con identidad compartida los cooldowns
  por usuario se habrían pisado entre ellos.
- La coreografía sola **reventó la ronda en 48 segundos** y encadenó el marcador y la ronda
  siguiente, sin intervención manual. El vídeo de 90 s cabe con margen.
- La sala se ve poblada: aforo de 5, pulso en rojo por el ritmo de ediciones, cuatro voces
  en el pasillo y el paciente citando a sus editores por su nombre.

## Qué se modificó

- `docs/entregables.md` (nuevo)
- `apps/agent/src/extras.ts` (nuevo), `apps/agent/package.json`, `package.json`
