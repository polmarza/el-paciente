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
  /** Solo en tránsito agente → Portal. El middleware lo elimina antes de repartir. */
  secret?: string;
}

export interface SystemMessage {
  role: "system";
  body: string;
  secret?: string;
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
  secret?: string;
}

export type BrainMessage = BrainEdit | BrainSeed;

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
