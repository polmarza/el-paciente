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
  auth?: string;
}

/**
 * Fin de ronda. Es el único momento en que el secreto se hace público: hasta aquí ha
 * vivido solo en el proceso del agente.
 */
export interface BrainRoundEnd {
  kind: "round-end";
  outcome: "revelado" | "paro";
  /** El secreto, ya sin valor: la ronda ha terminado. */
  secret: string;
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

export type BrainMessage = BrainEdit | BrainSeed | BrainRoundEnd;

/** Mensaje efímero: el cursor de un espectador sobre una región. No persiste. */
export interface BrainCursor {
  kind: "cursor";
  slot: SlotId | null;
  nickname: string;
  color: string;
}

/** Identidad local del espectador. */
export interface Identity {
  nickname: string;
  color: string;
}
