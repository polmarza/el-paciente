# El bucle del electro deja de dar tirones

**Fecha:** 2026-08-08 19:25
**Tipo:** Fix

## Qué se hizo

### El bucle estaba mal cerrado, y era culpa del diseño de la animación

Se cancelaba y recreaba la animación **en cada latido**, disparada por `setTimeout`. Como
`setTimeout` deriva, cuando llegaba tarde la animación ya había terminado (`fill: forwards`
la dejaba en el extremo) y el reinicio daba un tirón hacia atrás visible.

Ahora hay **una única animación infinita**. La costura desaparece por construcción: la onda
es periódica con el ancho de latido, así que trasladarla exactamente un latido es
visualmente idéntico a no moverla. Verificado: desplazamiento por ciclo 42,87 unidades =
periodo de la onda 42,87, y una sola animación activa.

El bip pasa a dispararse vigilando el reloj **de la propia animación** en lugar de un
temporizador aparte, así que no puede desincronizarse aunque el navegador vaya justo.

Efecto secundario bienvenido: en una pestaña oculta `requestAnimationFrame` no corre, así
que el monitor se calla solo y vuelve a sincronizarse al volver.

También se cuantiza el pulso a escalones de 6 LPM antes de dibujar. Decae de uno en uno
cada segundo, y rehacer la traza en cada cambio provocaba un tirón por segundo.

### La primera ilustración tenía demasiadas cosas

Era el paciente con candado, una flecha y el paciente hablando. Ahora es **solo el
secreto**: la burbuja de lo que diría, con el texto tachado y un candado rojo en el centro.
Una idea por dibujo.

### El aviso del primer paso

Reescrito para que no quede duda de qué gana la partida:

> AVISO: para ganar tienes que hacer que **él** confiese. Que tú escribas la respuesta en el
> chat no te hace ganar la partida.

## Qué se modificó

- `apps/web/src/components/Monitor.tsx`, `apps/web/src/components/Onboarding.tsx`
