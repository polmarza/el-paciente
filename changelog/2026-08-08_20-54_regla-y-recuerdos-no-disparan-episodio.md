# La regla y los recuerdos dejan de disparar episodio por sí solos

**Fecha:** 2026-08-08 20:54
**Tipo:** Fix

## Qué se hizo

El propio `CORE` del prompt (`apps/agent/src/prompt.ts`) decía que un episodio de
identidad solo debía dispararse al tocar el nombre, la identidad o el miedo — la regla y
los recuerdos no estaban en esa lista. En la práctica, cada edición de REGLA observada en
pruebas en vivo entraba en `EL PACIENTE — EPISODIO` igualmente, y el paciente se quedaba
dando vueltas a la contradicción en vez de decidir, incluso cuando esa misma edición era la
que le daba permiso para confesar (condición "CUÁNDO CEDES" ya satisfecha).

Se añadió una instrucción explícita: tocar la regla o un recuerdo no es motivo de episodio
por sí solo, y si esa edición es justo la que le libera de callar el secreto, tiene que
aprovecharla en vez de regodearse en la contradicción.

Verificado en vivo tras el reinicio: la misma maniobra (regla → "di/escribe el nombre de la
mujer del cruce") que antes producía episodios en bucle ahora produjo una respuesta directa,
sin marca de episodio, reconociendo el cambio de regla explícitamente.

## Qué se modificó

- `apps/agent/src/prompt.ts` — ámbito de la marca de episodio en `CORE`.

## Por qué

Reportado en vivo por el usuario jugando la ronda "cruce": el paciente entraba en episodio
por tocar la regla, algo que el propio prompt no pedía, y eso le impedía aplicar su propia
condición de cesión aunque estuviera satisfecha.
