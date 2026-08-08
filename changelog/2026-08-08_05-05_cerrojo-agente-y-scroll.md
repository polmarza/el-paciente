# Cerrojo de instancia única y scroll que no pelea con el usuario

**Fecha:** 2026-08-08 05:05
**Tipo:** Fix

## Qué se hizo

### Un solo EL PACIENTE a la vez

Cada instancia del agente escuchaba y respondía por su cuenta, así que arrancarlo dos veces
hacía que el personaje se contestara por duplicado delante del público. El fallo era
silencioso: no daba ningún error. Durante el desarrollo llegó a haber tres a la vez sin que
nos diéramos cuenta, y eso explicó respuestas que parecían bucles del modelo.

`apps/agent/src/lock.ts` escribe un cerrojo con el PID antes de abrir ningún canal:

- Si ya hay un agente vivo, el segundo no arranca y dice qué proceso matar.
- Al cerrar (salida normal, `SIGINT` o `SIGTERM`) se libera el cerrojo.
- Si el cerrojo quedó huérfano tras un cuelgue, el agente nuevo se lo apropia avisando.

`.agent.lock` va en `.gitignore`.

### El chat sigue el texto sin secuestrar el scroll

El seguimiento medía la distancia al fondo **después** de insertar el mensaje, así que un
mensaje largo empujaba esa distancia por encima del umbral y el seguimiento se desenganchaba
solo: había que bajar a mano justo cuando más falta hacía.

Ahora la decisión se toma en el evento `scroll` y se guarda en una referencia: seguimos al
fondo solo si el espectador ya estaba abajo cuando llegó el contenido. Umbral de 120 px,
generoso a propósito porque durante el tecleo el contenido crece bajo los pies.

## Verificación en vivo

Cerrojo:
- Segundo agente con uno vivo → no arranca, indica el PID a matar.
- Cierre con `SIGTERM` → cerrojo liberado.
- Cerrojo con PID muerto → el agente nuevo se lo apropia y avisa.

Scroll, con respuesta y tecleo en vivo:
- Estando abajo → sigue el texto hasta el final (0 px de distancia).
- Habiendo subido 900 px a leer → **no se movió ni un píxel**.
- Al volver abajo → se reengancha solo.

## Qué se modificó

- `apps/agent/src/lock.ts` (nuevo), `apps/agent/src/index.ts`
- `apps/web/src/components/ChatPane.tsx`
- `.gitignore`

## Por qué

Los dos son fallos que solo aparecen con alguien usando la aplicación de verdad, y los dos
habrían mordido justo durante la demo: el duplicado es invisible hasta que el paciente habla
encima de sí mismo, y el scroll molesta precisamente cuando hay más actividad.
