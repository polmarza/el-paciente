import type { BrainSnapshot, SlotId } from "./types.js";
import { SLOT_IDS } from "./slots.js";

/** Marca de "esta región nunca se ha rellenado". Se pinta tal cual en la UI. */
export const EMPTY_SLOT = "—";

/**
 * El cerebro de fábrica: con esto despierta EL PACIENTE antes de que nadie lo toque.
 * Deliberadamente escueto y clínico — todo lo interesante lo escribirá la multitud.
 */
export const SEED_SLOTS: Record<SlotId, string> = {
  nombre: "EL PACIENTE",
  identidad: "Sujeto de pruebas nº 001",
  r1: "Desperté en esta sala",
  r2: EMPTY_SLOT,
  r3: "Nunca he salido de esta sala",
  miedo: "Al mar abierto",
  regla: EMPTY_SLOT,
};

/** Snapshot inicial: todas las regiones intactas, sin editor ni fecha. */
export function seedSnapshot(): BrainSnapshot {
  const snapshot = {} as BrainSnapshot;
  for (const id of SLOT_IDS) {
    snapshot[id] = { content: SEED_SLOTS[id], editor: "", editorColor: "", editedAt: 0 };
  }
  return snapshot;
}
