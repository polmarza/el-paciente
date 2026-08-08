# El pasillo también arranca vacío en cada ronda

**Fecha:** 2026-08-09 00:14
**Tipo:** Fix

## Qué se hizo

El chat principal se filtra en el cliente por `entry.at >= brain.roundStartedAt` desde hace
tiempo, para que cada paciente llegue a una sala limpia. El pasillo nunca recibió el mismo
tratamiento: `App.tsx` le pasaba `pasillo.entries` sin filtrar, así que la deliberación de
rondas anteriores —o, como se vio en producción recién desplegada, de sesiones de pruebas
durante el desarrollo— se quedaba visible para siempre. No era una decisión de producto
documentada en ningún sitio: se quedó fuera sin más al construir el filtro del chat.

Se añadió `visiblePasillo`, mismo filtro que `visibleEntries`, y se conecta a
`PasilloPane`. Verificado en vivo: con el filtro, la ronda en curso muestra el pasillo
vacío (los mensajes de prueba de horas antes quedan fuera al ser de una ronda anterior), y
un mensaje nuevo enviado dentro de la ronda actual sí aparece con normalidad.

## Qué se modificó

- `apps/web/src/App.tsx` — `visiblePasillo`, pasado a `PasilloPane` en vez de
  `pasillo.entries` directamente.
- `docs/data-model.md` — documentado el filtro por ronda también para el canal `pasillo`.

## Por qué

El usuario, ya con la web desplegada en producción, vio los mensajes de las sesiones de
prueba de esta misma jornada de trabajo todavía visibles en el pasillo y preguntó si no
sería "más legal" que cada nueva sesión empezara vacía. Sí lo era: el chat principal ya
hacía exactamente eso, el pasillo se había quedado atrás por inconsistencia, no por diseño.
