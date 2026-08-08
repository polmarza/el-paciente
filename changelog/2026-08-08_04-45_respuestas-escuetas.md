# EL PACIENTE deja de divagar

**Fecha:** 2026-08-08 04:45
**Tipo:** Feature

## Qué se hizo

Las respuestas se iban a unos 700 caracteres y agotaban el techo de tokens. En un chat en
directo eso son casi diez segundos de tecleo en el navegador antes de que termine la frase,
y el personaje se diluía en divagación.

- **Prompt:** la brevedad pasa a ser la primera regla y la más dura — máximo dos frases y
  200 caracteres, prohibido encadenar preguntas o corregirse a media frase.
- **Episodios de crisis:** antes el prompt los describía como desorientación, lo que invitaba
  a la espiral. Ahora se define un episodio como una respuesta **más seca**, no más larga:
  señalar la contradicción concreta y callarse, con un ejemplo dentro del propio prompt.
- **`max_tokens`** baja de 220 a 100. El control real es la instrucción; el techo es la red.
- **Corte limpio:** si `finish_reason` es `length`, la respuesta se recorta hasta la última
  frase completa (`trimToLastSentence` en `apps/agent/src/text.ts`), para que nunca se vea
  un corte a media palabra. Cubierto con 5 tests.

## Resultado medido

| | Antes | Después |
|---|---|---|
| Longitud típica | ~700 caracteres | 50–115 caracteres |
| Turno completo (red + tecleo) | ~13,4 s | ~3,6 s |

Ejemplo real de episodio, después del cambio:
"@lucia38 escribió que soy huérfano. @lucia38 escribió que mi madre me odia. ¿A quién conocí
entonces?"

Además de más rápido, es mejor texto: localiza la contradicción y remata, en vez de enumerar
todas sus dudas.

## Qué se modificó

- `apps/agent/src/prompt.ts` (reglas de brevedad y definición de episodio)
- `apps/agent/src/llm.ts` (`max_tokens`, corte por `finish_reason`)
- `apps/agent/src/text.ts` y `text.test.ts` (nuevos)

## Por qué

Petición directa tras verlo en vivo: "está divagando demasiado". El diagnóstico previo ya
apuntaba ahí — el cuello de botella del directo era la longitud de la respuesta, no la red
ni el proveedor de inferencia.
