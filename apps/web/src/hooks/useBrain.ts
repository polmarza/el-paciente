import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChannel } from "@portalsdk/react";
import type { ChannelStatus, Message } from "@portalsdk/core";
import {
  CHANNEL_BRAIN,
  checkSlotValue,
  reduceBrain,
  type BrainMessage,
  type BrainState,
  type Identity,
  type SlotId,
} from "@el-paciente/shared";
import { rejectionReason, toHistory } from "../lib/portal-message";
import { SESSION_ID } from "../lib/identity";

/** Un cursor ajeno posado sobre una región. */
export interface RemoteCursor {
  sid: string;
  slot: SlotId;
  nickname: string;
  color: string;
  at: number;
}

/** Cada cuánto reanunciamos nuestro cursor mientras editamos. */
const CURSOR_HEARTBEAT_MS = 2000;
/** Sin señal durante este tiempo, damos el cursor ajeno por retirado. */
const CURSOR_TTL_MS = 5000;

interface CursorPayload {
  kind: "cursor";
  /** Identificador de pestaña: dos pestañas del mismo anónimo son dos cursores. */
  sid: string;
  slot: SlotId | null;
  nickname: string;
  color: string;
}

type BrainChannelMessage = BrainMessage | CursorPayload;

export interface UseBrainResult extends BrainState {
  cursors: RemoteCursor[];
  presenceCount: number;
  status: ChannelStatus;
  /** Publica una edición. Devuelve el motivo del rechazo, o null si salió bien. */
  edit: (slot: SlotId, value: string) => Promise<string | null>;
  /** Anuncia (o retira, con null) nuestro cursor sobre una región. */
  announceCursor: (slot: SlotId | null) => void;
  /** Pide un paciente nuevo. El agente decide si atiende. */
  requestNewGame: () => void;
}

export function useBrain(identity: Identity): UseBrainResult {
  const [cursors, setCursors] = useState<Map<string, RemoteCursor>>(new Map());
  const [tick, setTick] = useState(0);

  const onMessage = useCallback((message: Message<BrainChannelMessage>) => {
    const payload = message.content;
    if (payload?.kind !== "cursor" || payload.sid === SESSION_ID) return;

    setCursors((current) => {
      const next = new Map(current);
      if (payload.slot === null) next.delete(payload.sid);
      else next.set(payload.sid, { ...payload, slot: payload.slot, at: Date.now() });
      return next;
    });
  }, []);

  const { messages, presence, status, send } = useChannel<BrainChannelMessage>({
    channelId: CHANNEL_BRAIN,
    history: 200,
    onMessage,
  });

  // Los cursores caducan solos: si alguien cierra la pestaña, su etiqueta se va.
  useEffect(() => {
    const id = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const liveCursors = useMemo(() => {
    void tick;
    const cutoff = Date.now() - CURSOR_TTL_MS;
    return [...cursors.values()].filter((cursor) => cursor.at >= cutoff);
  }, [cursors, tick]);

  const state = useMemo<BrainState>(() => {
    const persisted = messages.filter(
      (message): message is Message<BrainMessage> =>
        !message.ephemeral && !message.retracted && message.content?.kind !== "cursor",
    );
    return reduceBrain(toHistory<BrainMessage>(persisted));
  }, [messages]);

  const snapshotRef = useRef(state.snapshot);
  snapshotRef.current = state.snapshot;

  const edit = useCallback(
    async (slot: SlotId, value: string): Promise<string | null> => {
      const trimmed = value.trim();
      const check = checkSlotValue(trimmed);
      if (!check.ok) return check.reason;

      try {
        await send({
          content: {
            kind: "edit",
            slot,
            value: trimmed,
            prev: snapshotRef.current[slot].content,
            nickname: identity.nickname,
            color: identity.color,
          },
        });
        return null;
      } catch (error) {
        // El middleware devuelve el motivo del cooldown en `BlockedError.reason`.
        return rejectionReason(error, "El quirófano ha rechazado la intervención.");
      }
    },
    [send, identity],
  );

  // Mientras haya un cursor propio puesto, lo reanunciamos para que no caduque.
  const heldSlot = useRef<SlotId | null>(null);

  const publishCursor = useCallback(
    (slot: SlotId | null) => {
      void send({
        ephemeral: true,
        content: {
          kind: "cursor",
          sid: SESSION_ID,
          slot,
          nickname: identity.nickname,
          color: identity.color,
        },
      }).catch(() => {
        // Un cursor perdido no rompe nada: es decoración en vivo.
      });
    },
    [send, identity],
  );

  const publishRef = useRef(publishCursor);
  publishRef.current = publishCursor;

  const announceCursor = useCallback((slot: SlotId | null) => {
    heldSlot.current = slot;
    publishRef.current(slot);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (heldSlot.current) publishRef.current(heldSlot.current);
    }, CURSOR_HEARTBEAT_MS);
    return () => clearInterval(id);
  }, []);

  const requestNewGame = useCallback(() => {
    void send({ content: { kind: "new-game", nickname: identity.nickname } }).catch(() => {
      // Si Portal la rechaza, no pasa nada: nadie ha perdido su partida.
    });
  }, [send, identity]);

  return {
    ...state,
    cursors: liveCursors,
    requestNewGame,
    presenceCount: presence?.count ?? 0,
    status,
    edit,
    announceCursor,
  };
}
