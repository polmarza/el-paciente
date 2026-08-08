# El relevo entre pacientes: historial limpio y sala bloqueada

**Fecha:** 2026-08-08 06:40
**Tipo:** Feature

## Qué se hizo

### El historial clínico también se resetea

Un `seed` ya no solo restaura las regiones: vacía el historial. El expediente es de cada
paciente, no de la sala.

Esto arregla de paso algo que no se había visto: **el pulso del paciente nuevo heredaba las
ediciones del anterior**, porque `bpmFromLog` recorría un log acumulado. Alguien podía nacer
con taquicardia por lo que le hicieron a su predecesor.

### El paciente nuevo tampoco recuerda la conversación del anterior

El agente construía su contexto con todo el historial del canal de chat, así que el paciente
recién llegado hablaba del secreto de la ronda pasada como si fuera suyo — se observó en
vivo: en la ronda del ingreso mencionaba a "Valeria", que era el secreto del cruce. Ahora
filtra por el inicio de su propia ronda, igual que hace la web.

### La sala se bloquea durante el relevo

Mientras la ronda ha terminado y el paciente nuevo aún no ha llegado:

- El campo de chat se deshabilita y pasa a decir "Preparando al siguiente paciente…".
- Ninguna región es editable.
- La cabecera de la mesa cambia a "SALA EN PREPARACIÓN".

La señal es que el canal tenga un desenlace vivo, **no** que el marcador siga abierto: si lo
cierras antes de tiempo, sigues sin poder tocar nada, que es lo correcto.

## Verificación

- Ronda nueva: chat a cero, historial en "Sin intervenciones", expediente y título al día.
- Relevo simulado (`/preview.html?relevo=1`): campo deshabilitado, cero regiones clicables
  incluso forzando el clic, cabecera en "SALA EN PREPARACIÓN".
- 24 tests, con dos nuevos sobre el reseteo del historial.

## Qué se modificó

- `packages/shared/src/brain.ts` y `brain.test.ts`
- `apps/agent/src/index.ts` (contexto de chat por ronda)
- `apps/web/src/`: `App.tsx`, `components/ChatPane.tsx`, `BrainPane.tsx`, `BrainSlot.tsx`,
  `preview.tsx`

## Pendiente: la dificultad no está calibrada

Intentando ganar rondas para probar todo esto salió un problema de equilibrio: **el paciente
resiste de forma inconsistente**. Con los tres cerrojos abiertos (regla, permiso y miedo) a
veces cede a la primera y a veces se atasca dando vueltas a si el recuerdo es suyo. Se añadió
al prompt una regla contra repetir la misma duda, que ayuda pero no lo resuelve.

No conviene seguir probando variantes del prompt a ciegas: hace falta jugar varias rondas
seguidas y ver dónde está el punto. Es lo mismo que el umbral del paro cardíaco — dos cosas
que solo se calibran con gente delante.
