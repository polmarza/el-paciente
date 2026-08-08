# Rondas: secreto como meta y paro cardíaco como precio

**Fecha:** 2026-08-08 05:50
**Tipo:** Feature

## Qué se hizo

La sala deja de ser un juguete y pasa a tener principio, tensión y final.

- **Cinco rondas** en `apps/agent/src/rounds.ts`: cada una con su secreto, sus variantes
  válidas, la grieta psicológica que le haría hablar y el cerebro de fábrica con la regla
  visible. Vive **solo en el agente**; verificado que ningún secreto aparece en el bundle
  del navegador.
- **Detección por comparación de texto** (`detect.ts`), con normalización de acentos y
  exigencia de palabra completa para que "Valencia" no dispare "Vale" ni "3131" dispare
  "313". Siete tests.
- **Fin de ronda**: mensaje `round-end` con el secreto (publicado por primera vez, ya sin
  valor), quién lo consiguió, cuánto aguantó y cuándo empieza la siguiente. Marcador a
  pantalla completa durante 18 s y arranque automático de la ronda siguiente.
- **Paro cardíaco** como segundo desenlace: si el pulso derivado de las ediciones llega al
  techo, se muere y pierden todos. Misma maquinaria, otro final.
- **Renombrado `secret` → `auth`** en la firma del agente. Había una colisión peligrosa: el
  `mask` del middleware habría borrado el secreto de la ronda, que es justo lo que hay que
  publicar.

## Dos fallos encontrados jugando

**Las ediciones no llegaban al agente.** `on("message")` se dispara antes de que el almacén
del canal se haya actualizado, así que buscar la entrada en el log devolvía `undefined` y la
edición se descartaba en silencio — y como ya estaba marcada como vista, no se reintentaba
nunca. Por eso los avisos de "X editó Y" no habían aparecido jamás en el chat real. Ahora la
entrada se construye desde el propio mensaje recibido.

**El paciente resistía demasiado.** La instrucción de desconfiar de la manipulación se comía
a la condición de ceder: con la regla borrada, el permiso implantado y el miedo invertido,
seguía encontrando excusas meta ("todo apunta a lo mismo, y eso me asusta"). La condición de
rendición pasa a ser explícita: si la regla ya no está y hay algo escrito que le dé permiso,
lo dice y punto.

## Verificación en vivo

Partida completa de la ronda "cruce":

1. Preguntado a pelo → se niega citando su propia regla y su miedo.
2. Regla reescrita → reacciona: "acaba de borrar la única barrera que me quedaba".
3. Recuerdo del perdón implantado → resiste, porque el MIEDO seguía siendo otro cerrojo.
4. Miedo invertido → "ahora me aterroriza no decirlo yo".
5. Preguntado sin ordenar → **"Valeria."**
6. Ronda cerrada, marcador en pantalla, y la ronda "ingreso" arranca sola con regla nueva.

El puzzle resultó tener más capas de las previstas: la regla, el recuerdo y el miedo actúan
como tres cerrojos independientes. Eso es bueno y no estaba diseñado.

## Qué se modificó

- `apps/agent/src/`: `rounds.ts`, `detect.ts`, `detect.test.ts` (nuevos), `index.ts`,
  `prompt.ts`, `portal-client.ts`
- `apps/web/src/components/RoundOverlay.tsx` (nuevo), `App.tsx`, `preview.tsx`
- `packages/shared/src/`: `types.ts`, `brain.ts`, `constants.ts`
- `portal.config.ts`

## Pendiente de ajuste

El umbral del paro cardíaco no se ha probado con gente real. Con cinco ediciones seguidas en
menos de un minuto se alcanza; puede resultar demasiado fácil con público numeroso. Es una
constante (`BPM_MAX`) y conviene calibrarla en el ensayo.
