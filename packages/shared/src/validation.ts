import { MAX_CHAT_CHARS, MAX_SLOT_CHARS } from "./constants.js";

export type Check = { ok: true } | { ok: false; reason: string };

const OK: Check = { ok: true };

/**
 * Reglas de contenido compartidas por la UI y el middleware de Portal.
 * La UI las usa para no dejar enviar basura; el middleware es la verdad.
 */
export function checkSlotValue(value: unknown): Check {
  if (typeof value !== "string") return { ok: false, reason: "El valor no es texto." };
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, reason: "Una región no puede quedarse vacía." };
  if (trimmed.length > MAX_SLOT_CHARS) {
    return { ok: false, reason: `Máximo ${MAX_SLOT_CHARS} caracteres por región.` };
  }
  return OK;
}

export function checkChatBody(body: unknown): Check {
  if (typeof body !== "string") return { ok: false, reason: "El mensaje no es texto." };
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, reason: "El mensaje está vacío." };
  if (trimmed.length > MAX_CHAT_CHARS) {
    return { ok: false, reason: `Máximo ${MAX_CHAT_CHARS} caracteres por mensaje.` };
  }
  return OK;
}

/** Mensaje de cooldown legible, tal como lo verá el espectador en el toast. */
export function cooldownReason(secondsLeft: number): string {
  if (secondsLeft <= 1) return "Esa región todavía está en carne viva. Un segundo.";
  return `Esa región todavía está en carne viva. Espera ${secondsLeft} s.`;
}
