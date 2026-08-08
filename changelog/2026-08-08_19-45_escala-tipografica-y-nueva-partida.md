# Escala tipográfica, reubicaciones y botón de nueva partida

**Fecha:** 2026-08-08 19:45
**Tipo:** Feature

## Qué se hizo

### Trece tamaños de letra, seis pasos

La interfaz usaba **13 tamaños distintos** repartidos por los componentes, que era la razón
de fondo de que pareciera cosida de trozos. Ahora hay una escala en `theme.ts` y nada fuera
de ella: `micro` 11 (etiquetas y metadatos), `small` 12.5 (instrumental), `body` 14 (lo que
se lee y se escribe), `lead` 18 (el pulso y el nombre que eliges), `voice` 19 (la voz del
paciente) y `title` 30.

### Los dos composers eran distintos

El del chat llevaba la chapa del nombre y una altura; el del pasillo, otra. Ahora los dos
son lo mismo —campo más botón `↵`— y miden exactamente igual (36 px de campo, 38 de caja).

### Reubicaciones

- El aviso de que el paciente no lee el pasillo pasa a ser una línea pequeña en minúscula
  sobre el chat: "El paciente no puede leer este chat". Deja de gritar en versalitas.
- En su hueco de la cabecera del pasillo, el aforo (`● N DENTRO`), que es donde tiene
  sentido: el pasillo es la sala de los vivos.
- Y en el hueco que deja el aforo arriba a la derecha, **tu nombre**, que además se edita
  ahí. Se quita de la barra del chat, que era donde descuadraba las alturas.

### Botón de nueva partida

Pedido dos veces, e implementado con el freno que faltaba. Cualquiera puede pedir un
paciente nuevo desde la cabecera —hay confirmación de dos toques— pero **el agente decide**:
ignora la petición si la ronda lleva menos de 45 s o si hubo otro relevo en el último
minuto, y en ambos casos lo dice en voz alta con el nombre de quien lo pidió. Sin
autenticación no se puede impedir que alguien lo pulse; lo que sí se puede es que no salga
gratis ni en silencio.

Eso destapó una incoherencia: cerrar la ronda a petición la marcaba como paro cardíaco, y el
marcador decía que se había muerto cuando nadie lo mató. Se añade un **tercer desenlace,
`retirado`**, con su propio texto y su color neutro en el marcador y en el parte descargable.

### Onboarding

`GANÁIS:` y `PERDÉIS:` en versalitas, siguiendo a `AVISO:` y `CUIDADO:`. Y bajo el campo del
nombre, la nota: "* También será el nombre por el cual te reconocerán el resto de usuarios."

## Verificación en vivo

Alturas de los dos composers medidas e idénticas. Escala aplicada: los elementos que pintan
texto solo usan pasos de la escala. Flujo de nueva partida completo: confirmación `¿SEGURO?`,
el agente registra `@dr_bisturi pidió un paciente nuevo`, cierra la ronda y arranca la
siguiente ("faro").

## Qué se modificó

- `apps/web/src/theme.ts` (escala), y los nueve componentes
- `apps/web/src/App.tsx`, `hooks/useBrain.ts`, `lib/diploma.ts`
- `packages/shared/src/types.ts`, `brain.ts`; `portal.config.ts` (desplegado)
- `apps/agent/src/index.ts`
