# El electro pasa a ser una traza de verdad, y el silenciador deja de duplicarse

**Fecha:** 2026-08-08 19:20
**Tipo:** Fix

## Qué se hizo

### El latido duplicado que no se podía silenciar

Reportado como fallo grave. **Diagnóstico: era la recarga en caliente.** Comprobado con una
recarga completa: silenciar deja el contador de bips en 0. Lo que pasaba es que cada
edición del código dejaba una copia vieja del módulo con su propio temporizador y su propio
interruptor, así que sonaba doble y el botón solo apagaba una de las dos.

Aun así se blinda, porque durante un hackathon se recarga en caliente constantemente: el
estado del sonido pasa a vivir en `globalThis` en lugar del módulo, de modo que todas las
copias obedecen al mismo interruptor.

### El electro era una animación fija; ahora es una traza

Antes: un trazo estático de dos picos al que se le barría un guion. El bip no cuadraba con
el pico y la forma no cambiaba nunca, subiera el pulso lo que subiera.

Ahora la traza **se genera a partir del pulso**:

- Los latidos se dibujan con su onda P, su complejo QRS y su onda T, separados según los
  LPM. Al subir el pulso se acercan: la onda no solo va más rápida, se ve más apretada.
  Medido: de 40 unidades de separación a 83 LPM, a 38 a 89 LPM.
- La traza avanza exactamente un latido por ciclo, así que **la sincronía es por
  construcción**: en cada bip hay un pico R sobre la referencia. Verificado midiendo la
  posición del pico en el instante exacto de cada bip — x=55,00 las nueve veces, desvío
  0,00. Desaparece la constante `PEAK_AT`, que era el único número que había que ajustar
  a ojo.

### Los interruptores no decían si estaban encendidos

Ahora encendido es verde con fondo tenue, y apagado es gris y tachado. Verificado:
`rgb(87,217,163)` sin tachar encendido, `rgb(66,80,89)` con `line-through` apagado.

## Qué se modificó

- `apps/web/src/components/Monitor.tsx` (traza generada, sincronía por construcción,
  `ToggleButton`)
- `apps/web/src/lib/sound.ts` (estado compartido a prueba de recarga en caliente)
