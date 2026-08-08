# Instrucciones de entrada y el pasillo

**Fecha:** 2026-08-08 09:00
**Tipo:** Feature

## Qué se hizo

### Modal de entrada en cinco pasos

Quien llega por primera vez ve las instrucciones antes de tocar nada: qué es el paciente,
cómo se opera, cuál es el objetivo, cuál es el precio (el paro), y por último **elige su
nombre**. Esa elección importa más de lo que parece: el nombre es lo que queda escrito en el
historial del paciente y lo que él cita cuando se da cuenta de que le han tocado. Sin nombre
propio, las crisis de identidad no señalan a nadie.

Se enseña una vez por navegador y se puede reabrir con el botón `?` de la cabecera. Hay un
"SALTAR" en todos los pasos para quien ya sepa de qué va.

### El pasillo: tercera columna para el público

Canal nuevo (`pasillo`) a la izquierda, donde los espectadores hablan **entre ellos**.

Lo importante es lo que NO hace: **el agente no abre ese canal**. EL PACIENTE no lee la
estrategia, porque si la leyera no habría estrategia. Verificado: el agente abre exactamente
`chat` y `brain`.

Separarlo también arregla un problema de tono. Sin él, la conversación que el paciente sí ve
se llena de órdenes tipo "prueba a borrarle la regla", y esa conversación tiene que leerse
como una conversación de verdad para que el personaje funcione.

Cooldown de 1 s, solo anti-inundación. En pantallas por debajo de 1250 px el pasillo se
oculta: es deliberación del público, no la pieza.

### Layout

Tres columnas: pasillo 20 %, chat 45 %, mesa de operaciones 35 %.

## Verificación en vivo

- Entrada como usuario nuevo: los cinco pasos, cambio de nombre a `@dr_bisturi`, y el nombre
  aparece en el chat al entrar.
- Mensaje publicado en el pasillo y recibido con su autor.
- El agente no tiene acceso al canal (revisado en el código).

## Qué se modificó

- `packages/shared/src/`: `constants.ts`, `types.ts`, `validation.ts`
- `portal.config.ts` (middleware del pasillo; 3 canales desplegados)
- `apps/web/src/`: `App.tsx`, `hooks/usePasillo.ts`, `components/PasilloPane.tsx`,
  `components/Onboarding.tsx`, `components/Monitor.tsx`, `ChatPane.tsx`, `BrainPane.tsx`,
  `lib/identity.ts`, `styles.css`, `preview.tsx`
- `docs/roadmap.md` reescrito con el estado real; `docs/data-model.md` puesto al día (tenía
  desfasados el campo de firma, el reseteo del historial y los datos de arranque)
