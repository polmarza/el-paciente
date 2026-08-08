# Techo de tokens, tecleo acotado y repertorio de rondas

**Fecha:** 2026-08-08 05:26
**Tipo:** Feature

## Qué se hizo

### Diagnóstico previo: no había ningún texto cortado

Un mensaje que parecía truncado en pantalla estaba **completo** en el canal: lo que se veía
era la animación de tecleo a medias, con el cursor en su parpadeo apagado. La única respuesta
realmente cortada de todos los registros venía de una ejecución anterior al recorte por
frase. Con el recorte activo, tres de tres pruebas forzando el techo terminan bien.

### Aun así, la red estaba demasiado tensa

`max_tokens` sube de 100 a 160. Con la regla de brevedad del prompt haciendo de control real,
un techo de 100 cortaba respuestas normales y el recorte las descartaba en silencio.

### El tecleo deja de arrastrarse

Con una red más ancha, una respuesta larga tardaría más en escribirse en pantalla. Ahora la
revelación tiene un techo de duración de 2,8 s: hasta unos 200 caracteres mantiene el ritmo
exacto del diseño (2 caracteres cada 28 ms) y a partir de ahí acelera en vez de alargarse.

### Repertorio de rondas (pendiente de revisión)

`apps/agent/src/rounds.ts` con cinco rondas: secreto, variantes que cuentan como revelado,
la grieta psicológica que le haría hablar, y el cerebro de fábrica con la regla visible.

**Vive solo en el agente por diseño.** No debe importarse desde `apps/web` ni moverse a
`packages/shared`: ese paquete se compila al navegador y el secreto quedaría a la vista de
cualquiera. Verificado con una comprobación sobre el bundle: ninguno de los cinco secretos
aparece en `apps/web/dist`.

Todavía no está cableado: falta la detección, el final de ronda y el reinicio.

## Qué se modificó

- `apps/agent/src/llm.ts` (`MAX_TOKENS`)
- `apps/web/src/hooks/useAiReveal.ts` (techo de duración del tecleo)
- `apps/agent/src/rounds.ts` (nuevo)

## Por qué

Petición directa tras ver un texto aparentemente cortado. El diagnóstico descartó el fallo,
pero destapó que el techo sí estaba recortando de más.
