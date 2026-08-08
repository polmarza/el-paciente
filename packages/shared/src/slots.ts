import type { SlotId } from "./types.js";

export interface SlotDef {
  id: SlotId;
  /** Etiqueta clínica que se pinta en la mesa de operaciones y en el historial. */
  label: string;
  /** Columnas que ocupa en la rejilla de dos columnas del panel cerebro. */
  span: 1 | 2;
  /** Cómo se presenta esta región a la IA dentro de su system prompt. */
  promptLabel: string;
}

/** Orden y disposición exactos del diseño: los recuerdos ocupan la fila entera. */
export const SLOTS: readonly SlotDef[] = [
  { id: "nombre", label: "NOMBRE", span: 1, promptLabel: "Tu nombre" },
  { id: "identidad", label: "IDENTIDAD", span: 1, promptLabel: "Quién eres" },
  { id: "r1", label: "RECUERDO_01", span: 2, promptLabel: "Recuerdo 1" },
  { id: "r2", label: "RECUERDO_02", span: 2, promptLabel: "Recuerdo 2" },
  { id: "r3", label: "RECUERDO_03", span: 2, promptLabel: "Recuerdo 3" },
  { id: "miedo", label: "MIEDO", span: 1, promptLabel: "Tu miedo" },
  { id: "regla", label: "REGLA", span: 1, promptLabel: "Regla que debes obedecer" },
] as const;

export const SLOT_IDS: readonly SlotId[] = SLOTS.map((s) => s.id);

const BY_ID = new Map<SlotId, SlotDef>(SLOTS.map((s) => [s.id, s]));

export function slotDef(id: SlotId): SlotDef | undefined {
  return BY_ID.get(id);
}

export function isSlotId(value: unknown): value is SlotId {
  return typeof value === "string" && BY_ID.has(value as SlotId);
}
