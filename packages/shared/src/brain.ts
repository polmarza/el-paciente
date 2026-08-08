import type {
  BrainMessage,
  BrainRoundEnd,
  BrainSnapshot,
  SlotId,
  SlotState,
  SlotValue,
} from "./types.ts";
import { isSlotId } from "./slots.ts";
import { seedSnapshot } from "./seed.ts";
import {
  BPM_MAX,
  BPM_PER_EDIT,
  BPM_RESTING,
  FLASH_MS,
  SLOT_COOLDOWN_MS,
  DEFAULT_EXPEDIENTE,
} from "./constants.ts";

/**
 * Una entrada del historial de un canal, independiente de la forma exacta que tenga
 * un `Message` de Portal. Web y agente adaptan sus mensajes a esto antes de reducir,
 * de modo que la lógica del cerebro sea pura y testeable sin tocar la red.
 */
export interface HistoryEntry<T> {
  id: string;
  content: T;
  /** Epoch ms en que se publicó. */
  at: number;
}

/** Una línea del historial clínico: quién cambió qué y desde qué valor. */
export interface LogEntry {
  id: string;
  at: number;
  slot: SlotId;
  nickname: string;
  color: string;
  prev: string;
  next: string;
}

export interface BrainState {
  snapshot: BrainSnapshot;
  /** Historial clínico, del más reciente al más antiguo. */
  log: LogEntry[];
  /** Identificador de la ronda en curso, si el seed lo declaró. */
  round: string | null;
  /** Expediente del paciente actual. Cambia con cada ronda. */
  expediente: string;
  /**
   * Cuándo empezó la ronda actual. El chat se pinta solo desde aquí: cada paciente
   * llega a una sala limpia, sin la conversación del anterior.
   */
  roundStartedAt: number;
  /**
   * Desenlace de la ronda, mientras siga siendo el último acontecimiento. Un `seed`
   * posterior lo borra, así que el aviso en pantalla desaparece solo cuando empieza la
   * ronda siguiente.
   */
  roundEnd: BrainRoundEnd | null;
}

/**
 * Deriva el estado del cerebro a partir del historial del canal `brain`.
 *
 * Reglas: gana la última edición de cada región, y un `seed` empieza un paciente nuevo —
 * restaura las regiones y vacía el historial clínico, porque el expediente es de cada
 * paciente, no de la sala.
 */
export function reduceBrain(entries: readonly HistoryEntry<BrainMessage>[]): BrainState {
  const ordered = [...entries].sort((a, b) => a.at - b.at);

  let snapshot = seedSnapshot();
  const log: LogEntry[] = [];
  let round: string | null = null;
  let expediente = DEFAULT_EXPEDIENTE;
  let roundStartedAt = 0;
  let roundEnd: BrainRoundEnd | null = null;

  for (const entry of ordered) {
    const msg = entry.content;

    if (msg.kind === "seed") {
      snapshot = seedSnapshot();
      for (const [id, content] of Object.entries(msg.slots)) {
        if (isSlotId(id)) snapshot[id] = { content, editor: "", editorColor: "", editedAt: 0 };
      }
      round = msg.round ?? null;
      expediente = msg.expediente ?? DEFAULT_EXPEDIENTE;
      roundStartedAt = entry.at;
      // Paciente nuevo, historial nuevo: no hereda ni las cicatrices ni el pulso del
      // anterior. Sin esto, `bpmFromLog` le contaría al recién llegado las ediciones
      // que mataron al que estaba antes.
      log.length = 0;
      // Y el desenlace anterior deja de estar en pantalla.
      roundEnd = null;
      continue;
    }

    if (msg.kind === "round-end") {
      roundEnd = msg;
      continue;
    }

    if (msg.kind !== "edit" || !isSlotId(msg.slot)) continue;

    const previous = snapshot[msg.slot];
    snapshot[msg.slot] = {
      content: msg.value,
      editor: msg.nickname,
      editorColor: msg.color,
      editedAt: entry.at,
    };
    log.push({
      id: entry.id,
      at: entry.at,
      slot: msg.slot,
      nickname: msg.nickname,
      color: msg.color,
      // El `prev` del mensaje es lo que el editor veía; si falta, usamos el valor
      // que teníamos derivado, que es la verdad del canal.
      prev: msg.prev || previous.content,
      next: msg.value,
    });
  }

  log.reverse();
  return { snapshot, log, round, expediente, roundStartedAt, roundEnd };
}

/**
 * Estado visual de una región según cuánto hace que la editaron.
 * `editing` no se deriva de aquí: llega por los cursores efímeros.
 */
export function slotStateAt(value: SlotValue, now: number): SlotState {
  if (!value.editedAt) return "idle";
  const elapsed = now - value.editedAt;
  if (elapsed < FLASH_MS) return "flash";
  if (elapsed < FLASH_MS + SLOT_COOLDOWN_MS) return "cooldown";
  return "idle";
}

/** Segundos que le quedan a una región para volver a ser editable. */
export function cooldownSecondsLeft(value: SlotValue, now: number): number {
  if (!value.editedAt) return 0;
  const until = value.editedAt + FLASH_MS + SLOT_COOLDOWN_MS;
  return Math.max(0, Math.ceil((until - now) / 1000));
}

/** Pulso derivado del ritmo de ediciones: sube con cada corte, decae hacia el reposo. */
export function bpmFromLog(log: readonly LogEntry[], now: number): number {
  let bpm = BPM_RESTING;
  for (const entry of log) {
    const elapsed = (now - entry.at) / 1000;
    if (elapsed < 0 || elapsed > 60) continue;
    // Cada edición aporta un salto que se desvanece en un minuto.
    bpm += BPM_PER_EDIT * (1 - elapsed / 60);
  }
  return Math.min(BPM_MAX, Math.round(bpm));
}
