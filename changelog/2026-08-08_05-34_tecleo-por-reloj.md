# El tecleo deja de romperse al cambiar de ventana

**Fecha:** 2026-08-08 05:34
**Tipo:** Fix

## Qué se hizo

Reportado dos veces como "el texto se ha cortado". No se cortaba: **el mensaje llegaba
completo al canal** y era la animación de tecleo la que se quedaba a medias.

Dos causas, ambas mías:

1. **La animación contaba pulsos del temporizador en vez de mirar el reloj.** Los
   navegadores estrangulan los `setInterval` de las pestañas en segundo plano, así que al
   cambiar de ventana el texto avanzaba a rastras (medido: 11 caracteres por segundo en vez
   de 71) y al volver seguía a medias. Ahora cada pulso calcula cuánto texto **debería**
   estar visible según el tiempo transcurrido, así que un pulso tardío se pone al día de
   golpe. Además se escucha `visibilitychange` para actualizar al volver sin esperar.

2. **El efecto dependía del objeto del mensaje, no de su id.** Cualquier actualización del
   canal (presencia, actividad, otro escribiendo) recreaba ese objeto, relanzaba el efecto,
   limpiaba el temporizador, y la guarda de "ya animado" impedía rearrancarlo. Era un
   congelado permanente latente, y el latido de "pensando" cada 2 s lo hacía mucho más
   probable. Ahora depende solo del id y el mensaje se lee de una referencia.

También se garantiza que un turno interrumpido por otro mensaje se muestre entero: nunca
queda una frase a medias en pantalla.

## Verificación

Con la pestaña **oculta**, que es la condición que lo rompía:

| | Antes | Después |
|---|---|---|
| A los 21 s | 174 caracteres, sin terminar | — |
| A los 12 s | — | 258 caracteres, termina en punto, sin cursor |

## Qué se modificó

- `apps/web/src/hooks/useAiReveal.ts`

## Por qué

Es un fallo que solo aparece usando la aplicación como se usa de verdad: con más de una
ventana abierta. Durante la demo, cualquiera que mire el móvil un segundo se habría
encontrado a EL PACIENTE congelado a media frase.
