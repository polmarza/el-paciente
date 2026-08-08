/** Identificadores de las siete regiones de la mente de EL PACIENTE. */
export type SlotId = "nombre" | "identidad" | "r1" | "r2" | "r3" | "miedo" | "regla";

/** Estado visual de un slot, derivado del tiempo transcurrido desde su última edición. */
export type SlotState = "idle" | "editing" | "flash" | "cooldown";

/** Snapshot del cerebro: el valor actual de cada región. */
export type BrainSnapshot = Record<SlotId, SlotValue>;

export interface SlotValue {
  /** Contenido actual de la región. */
  content: string;
  /** Nickname de quien la editó por última vez. Vacío = valor de fábrica. */
  editor: string;
  /** Color del último editor, arrastrado desde su mensaje para pintar su rastro. */
  editorColor: string;
  /** Epoch ms de la última edición. 0 = nunca editada. */
  editedAt: number;
}

// ─── Canal `chat` ─────────────────────────────────────────────────────────────

export interface HumanMessage {
  role: "human";
  nickname: string;
  /** Color del autor, derivado de su nickname. Viaja en el mensaje para que el
   *  historial se pinte igual aunque el autor ya no esté conectado. */
  color: string;
  body: string;
}

export interface AiMessage {
  role: "ai";
  body: string;
  /** Marca los episodios de crisis de identidad: cambia el encabezado y el color. */
  crisis: boolean;
  /** Firma del agente. Solo en tránsito: el middleware la verifica y la elimina. */
  auth?: string;
}

export interface SystemMessage {
  role: "system";
  body: string;
  auth?: string;
}

export type ChatMessage = HumanMessage | AiMessage | SystemMessage;

// ─── Canal `brain` ────────────────────────────────────────────────────────────

export interface BrainEdit {
  kind: "edit";
  slot: SlotId;
  value: string;
  /** Valor anterior, para pintar el diff en el historial clínico. */
  prev: string;
  nickname: string;
  color: string;
}

export interface BrainSeed {
  kind: "seed";
  slots: Record<SlotId, string>;
  /** Identificador de la ronda que arranca. El secreto NUNCA viaja aquí. */
  round?: string;
  /** Número de expediente de este paciente. Cambia en cada ronda. */
  expediente?: string;
  /**
   * Parte de ingreso: dos frases que enmarcan el caso y dicen qué FORMA tiene la
   * respuesta (un nombre, un lugar, un número) sin darla. Es lo que convierte siete
   * campos de texto en una investigación: sin esto sabes que hay un secreto, pero no
   * qué estás buscando. Va en el seed y no en el código de la web porque el repertorio
   * de rondas vive solo en el agente.
   */
  caso?: string;
  auth?: string;
}

/**
 * Fin de ronda. Es el único momento en que el secreto puede hacerse público: hasta aquí ha
 * vivido solo en el proceso del agente.
 */
export interface BrainRoundEnd {
  kind: "round-end";
  /** `retirado` es el relevo pedido por la sala: nadie ganó, pero tampoco lo mataron. */
  outcome: "revelado" | "paro" | "retirado";
  /**
   * El secreto, presente en `revelado` (se lo ganaron) y en `paro` (se muere con él, y
   * eso también se cuenta). **Ausente en `retirado`**: nadie lo ha ganado, así que no es
   * contenido publicable — mostrarlo ahí sería un spoiler gratis, y encima de una ronda
   * que puede volver a salir más adelante.
   */
  secret?: string;
  /** Expediente del paciente que se lleva (o no) el secreto. */
  expediente: string;
  /** Quién se lo arrancó. Ausente si murió. */
  by?: string;
  /** Cuánto duró la ronda, en milisegundos. */
  lasted: number;
  /** Epoch ms en que arranca la siguiente. */
  nextAt: number;
  auth?: string;
}

/**
 * Petición de paciente nuevo. La publica cualquiera desde la cabecera; **el agente decide
 * si la atiende**. Sin autenticación no se puede impedir que alguien la pida, así que el
 * freno está en el agente, que la ignora si la ronda acaba de empezar o si ya hubo un
 * reinicio reciente. Y siempre se anuncia con nombre: quien la pide, la firma.
 */
export interface BrainNewGame {
  kind: "new-game";
  nickname: string;
}

export type BrainMessage = BrainEdit | BrainSeed | BrainRoundEnd | BrainNewGame;

/** Mensaje efímero: el cursor de un espectador sobre una región. No persiste. */
export interface BrainCursor {
  kind: "cursor";
  slot: SlotId | null;
  nickname: string;
  color: string;
}

// ─── Canal `pasillo` ──────────────────────────────────────────────────────────

/** Deliberación entre espectadores. El paciente no lee esto. */
export interface PasilloMessage {
  nickname: string;
  color: string;
  body: string;
}

/** Identidad local del espectador. */
export interface Identity {
  nickname: string;
  color: string;
}
