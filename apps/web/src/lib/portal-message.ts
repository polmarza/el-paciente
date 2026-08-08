import type { Message } from "@portalsdk/core";
import type { HistoryEntry } from "@el-paciente/shared";

/** Adapta los mensajes de un canal de Portal a la forma que consume el reducer. */
export function toHistory<T>(messages: readonly Message<T>[]): HistoryEntry<T>[] {
  return messages.map((message) => ({
    id: message.id,
    content: message.content,
    at: message.timestamp,
  }));
}

/**
 * El motivo por el que el quirófano rechazó una publicación.
 * `BlockedError.reason` es texto pensado para enseñárselo al usuario tal cual: es lo
 * que devuelven nuestros `block(...)` del middleware.
 */
export function rejectionReason(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const record = error as { reason?: unknown; message?: unknown };
    if (typeof record.reason === "string" && record.reason.trim()) return record.reason;
    if (typeof record.message === "string" && record.message.trim()) return record.message;
  }
  return fallback;
}
