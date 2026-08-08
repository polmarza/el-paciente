# Cada ronda es un paciente nuevo, y el desenlace se puede llevar uno

**Fecha:** 2026-08-08 06:18
**Tipo:** Feature

## Qué se hizo

### Cada ronda es un paciente distinto

- **Expediente propio por ronda** (`001-A`, `047-D`, `112-B`, `002-A`, `088-F`), publicado
  en el `seed` y pintado en la cabecera del monitor. Antes estaba fijo en `001-A`.
- **El chat se limpia** al empezar una ronda: se pinta solo desde el instante del `seed`,
  así que el paciente nuevo llega a una sala sin la conversación del anterior. No se borra
  nada del canal, solo se deja de mostrar lo que no es suyo.

Nota para quien añada rondas: el expediente **no puede contener el secreto**. La ronda de la
habitación llevaba `313-C` con secreto `313`, lo que lo regalaba en la cabecera. Corregido a
`088-F` y avisado con un comentario en el propio archivo.

### El marcador ya no se cierra solo

Se queda hasta que el usuario lo cierra, con la ronda siguiente arrancando por debajo. Como
el canal borra el desenlace en cuanto llega el `seed` nuevo, la web lo retiene en local y
recuerda cuál has cerrado, para no reabrírtelo.

La cuenta atrás sigue mientras corre; al llegar a cero pasa a "YA HAY UN PACIENTE NUEVO EN
LA SALA".

### Parte médico descargable

Botón que genera un PNG cuadrado de 1080×1080 con el expediente, el desenlace, el secreto,
quién lo consiguió y cuánto aguantó.

Se dibuja a mano sobre un lienzo en vez de capturar el DOM: sin dependencias externas (que
la política de contenidos del despliegue bloquearía de todos modos), con resolución fija
independiente de la pantalla de quien lo descarga, y con una composición pensada para verse
en un timeline en vez de ser una captura de la web. Espera a `document.fonts.ready` para que
no salga con la tipografía de reserva.

## Verificación

Generado el parte desde el botón real e inspeccionada la imagen resultante: tipografías
correctas, electrocardiograma, y el pie con el dominio.

## Qué se modificó

- `packages/shared/src/`: `types.ts`, `brain.ts`, `constants.ts`
- `apps/agent/src/`: `rounds.ts`, `index.ts`
- `apps/web/src/`: `App.tsx`, `components/Monitor.tsx`, `components/RoundOverlay.tsx`,
  `lib/diploma.ts` (nuevo), `preview.tsx`

## Por qué

Petición directa: que una ronda nueva se note como un paciente nuevo, que el marcador no se
esfume antes de poder leerlo, y que quien le saca un secreto pueda llevarse la prueba.
