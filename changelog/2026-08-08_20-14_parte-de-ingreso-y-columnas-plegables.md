# Parte de ingreso, historial en cajón y pasillo plegable

**Fecha:** 2026-08-08 20:14
**Tipo:** Feature

## Qué se hizo

1. **Parte de ingreso.** Cada ronda trae ahora dos frases fijas (`caso`) que enmarcan el
   caso y dicen qué FORMA tiene la respuesta — un nombre, un lugar, un número — sin decirla
   nunca. Antes el jugador aterrizaba delante de siete campos de memoria sin saber qué
   estaba buscando; el parte le da un gancho investigativo desde el primer segundo. Vive en
   `apps/agent/src/rounds.ts` junto al secreto (nunca en `packages/shared`, por la misma
   razón que el secreto no sale de ahí) y viaja en el `seed` de cada ronda. Se pinta con el
   nuevo componente `CaseBrief`, debajo de la mesa de operaciones.

   Se añadió una prueba (`detect.test.ts`) que recorre todo el repertorio y comprueba que
   ni el parte, ni el expediente, ni la regla contienen el secreto de su propia ronda — ya
   hubo un spoiler de este tipo con el expediente "313-C" de la ronda "habitacion", y esta
   vez queda cubierto por una prueba en vez de un comentario.

2. **Historial clínico en cajón.** Antes ocupaba una franja fija de 150px que competía por
   espacio con la mesa de operaciones. Ahora es un cajón (`EditLog`) anclado al fondo del
   panel, cerrado por defecto, que se abre con un clic o arrastrando su pestaña hacia
   arriba — y **pasa por encima** de la mesa en vez de comprimirla, porque las regiones son
   el juego y no deben reordenarse cada vez que alguien consulta el historial.

3. **Pasillo plegable.** La tercera columna se puede contraer a un riel vertical de 42px
   (con el aforo aún visible) para dejar la pantalla en dos columnas a gusto del
   espectador. La preferencia se recuerda en `localStorage`. El chat dejó de tener un ancho
   fijo (45%) y ahora absorbe el espacio que el pasillo libera al plegarse.

4. **Toast reposicionado.** Vivía abajo a la derecha y tapaba el parte de ingreso y la
   pestaña del historial — justo lo que hay debajo del toast en la práctica. Se movió
   arriba a la derecha, bajo la cabecera. De paso, un rechazo (cooldown, error de
   validación) usaba el mismo ámbar que una pista amistosa y costaba distinguirlos de un
   vistazo: el rechazo pasa a rojo de alarma, la pista se queda en ámbar.

5. Onboarding (paso "Mecánica") menciona ahora el parte de ingreso como primer punto de
   apoyo, antes de explicar los campos editables.

## Qué se modificó

- `packages/shared/src/types.ts` — `BrainSeed.caso`.
- `packages/shared/src/constants.ts` — `DEFAULT_CASO`.
- `packages/shared/src/brain.ts`, `brain.test.ts` — `BrainState.caso`, reducción y pruebas.
- `apps/agent/src/rounds.ts` — `Round.caso` + parte de ingreso de las 5 rondas.
- `apps/agent/src/index.ts` — el `seed` publica `caso`.
- `apps/agent/src/detect.test.ts` — repertorio no se delata solo (parte/expediente/regla).
- `apps/web/src/components/CaseBrief.tsx` (nuevo).
- `apps/web/src/components/EditLog.tsx` — reescrito como cajón arrastrable.
- `apps/web/src/components/BrainPane.tsx` — layout `position: relative`, monta `CaseBrief`.
- `apps/web/src/components/PasilloPane.tsx` — modo plegado (riel).
- `apps/web/src/components/ChatPane.tsx` — ancho flexible en vez de fijo.
- `apps/web/src/components/Toast.tsx` — reposicionado, color por tipo.
- `apps/web/src/components/Onboarding.tsx` — mención del parte en el paso "Mecánica".
- `apps/web/src/lib/layout.ts` (nuevo) — persistencia del plegado del pasillo.
- `apps/web/src/App.tsx` — estado y toggle del pasillo plegado.
- `apps/web/src/preview.tsx` — datos fijos actualizados con `caso`.
- `apps/web/src/styles.css` — media queries ajustadas al ancho flexible del chat.
- `docs/data-model.md`, `docs/design-system.md` — documentación de lo anterior. Se
  aprovechó para corregir una deriva previa no documentada (`outcome: "retirado"` y
  `BrainNewGame`, ya en producción pero ausentes del documento).

## Por qué

Feedback directo del usuario tras jugar una partida: "no sé qué tengo que buscar" (parte de
ingreso), el historial competía por espacio con la mesa de operaciones en vez de flotar
sobre ella, y quería poder plegar el pasillo para quedarse con dos columnas cuando le
interesa más la conversación con el paciente que la deliberación del público.
