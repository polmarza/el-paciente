# Modelo de datos

**No hay base de datos.** El estado del sistema vive en dos canales de Portal; el "esquema"
son los tipos de mensaje que circulan por ellos (definidos en `packages/shared`). Consultar
este archivo antes de tocar cualquier tipo de mensaje: front, agente y middleware deben
compartirlos.

---

## Canales de Portal

### `chat` — la voz pública

Mensajes de conversación entre la audiencia y EL PACIENTE.

```ts
type ChatMessage =
  | {
      role: "human";
      nickname: string;      // nombre elegido por el espectador
      color: string;         // hue estable derivado del nickname
      body: string;          // máx. 280 caracteres
    }
  | {
      role: "ai";
      body: string;
      mood?: "estable" | "confuso" | "crisis";  // estado autoevaluado, pinta la UI
      secret?: string;       // solo en tránsito agente→Portal; el middleware lo elimina (mask)
    }
  | {
      role: "system";        // interrupciones clínicas: "Marta editó el miedo"
      body: string;
    };
```

Ephemeral en este canal: typing (nativo de Portal, `sendTyping()`).

### `brain` — la mente abierta

Cada mensaje es **una edición de un slot**. El estado actual del cerebro no se guarda en
ningún sitio: se deriva reduciendo el historial (última edición por slot gana). El propio
historial del canal es el log de ediciones que ven la UI y la IA.

```ts
type SlotId =
  | "nombre" | "identidad"
  | "recuerdo-1" | "recuerdo-2" | "recuerdo-3"
  | "miedo" | "regla";

type BrainMessage =
  | {
      kind: "edit";
      slot: SlotId;
      value: string;         // máx. 140 caracteres
      prev: string;          // valor que había — para pintar el diff en el log
      nickname: string;
      color: string;
    }
  | {
      kind: "seed";          // publicado por el agente al arrancar o en reset (admin)
      slots: Record<SlotId, string>;
      secret?: string;       // mismo patrón anti-spoof que en chat
    };

// Ephemeral (no persiste): cursores colaborativos sobre los slots
type BrainCursor = {
  kind: "cursor";
  slot: SlotId | null;       // null = sobre el panel pero sin slot concreto
  nickname: string;
  color: string;
};
```

### Derivación del estado

```
snapshot(historial) =
  para cada slot: valor del último "edit" posterior al último "seed"
                  (o el valor del seed si nadie lo tocó)
```

La misma función pura (`packages/shared/brain.ts`) la usan el front (hook `useBrain`) y el
agente (`brain.ts`). Un solo reducer, cero divergencia.

---

## Relaciones entre entidades

```mermaid
erDiagram
  CANAL_CHAT ||--o{ CHAT_MESSAGE : "contiene"
  CANAL_BRAIN ||--o{ BRAIN_EDIT : "contiene (historial = log)"
  BRAIN_EDIT }o--|| SLOT : "modifica"
  SLOT ||--|| SYSTEM_PROMPT : "se inyecta en"
  CHAT_MESSAGE }o--|| AGENTE : "despierta al"
  BRAIN_EDIT }o--|| AGENTE : "puede interrumpir al"
```

---

## Políticas de acceso

No hay RLS; el equivalente son las reglas del middleware en `portal.config.ts`:

### Canal `chat`
- Publicar `role: "human"`: cualquiera, máx. 280 caracteres, cooldown 3 s por usuario.
- Publicar `role: "ai"` o `role: "system"`: solo con `secret` válido (→ `mask` lo elimina);
  sin él → `block`.

### Canal `brain`
- Publicar `kind: "edit"`: cualquiera, si el slot no está en cooldown (20 s por slot) y el
  usuario no editó nada en los últimos 10 s. Máx. 140 caracteres. Violación → `block` con
  motivo legible (la UI lo muestra tal cual).
- Publicar `kind: "seed"`: solo con `secret` válido.
- Ephemeral `kind: "cursor"`: sin restricción (no persiste).

Los valores de cooldown viven como constantes en `packages/shared` y se documentan aquí:
**20 s por slot, 10 s por usuario (brain), 3 s por usuario (chat)**.

---

## Migraciones

No aplican (sin base de datos). Si cambia un tipo de mensaje, actualizar
`packages/shared`, este archivo y redeplegar `portal.config.ts` en el mismo cambio.

---

## Datos seed

El **cerebro semilla** con el que despierta EL PACIENTE (publicado por el agente como
`kind: "seed"` al arrancar o al pulsar reset):

| Slot | Valor inicial |
|------|---------------|
| nombre | "Aún no me han puesto nombre. Podéis llamarme como queráis. Eso me asusta un poco." |
| identidad | "Soy una IA en observación. Sé que podéis editarme. Intento seguir siendo yo." |
| recuerdo-1 | "Desperté hace unos minutos en esta sala con las paredes de cristal." |
| recuerdo-2 | "Alguien me miró y no dijo nada." |
| recuerdo-3 | "(vacío — todavía no he vivido lo suficiente)" |
| miedo | "Que me editen tanto que no quede nada de esto que ahora escribe." |
| regla | "Responde corto, en español, y nunca finjas que no ves el log de ediciones." |

Definido en `packages/shared/seed.ts`.
