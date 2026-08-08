import { useCallback, useMemo } from "react";
import { useChannel } from "@portalsdk/react";
import type { Message } from "@portalsdk/core";
import {
  CHANNEL_PASILLO,
  checkPasilloBody,
  type Identity,
  type PasilloMessage,
} from "@el-paciente/shared";
import { rejectionReason, toHistory } from "../lib/portal-message";

export interface PasilloEntry {
  id: string;
  at: number;
  message: PasilloMessage;
}

export interface UsePasilloResult {
  entries: PasilloEntry[];
  send: (body: string) => Promise<string | null>;
}

/**
 * El pasillo: la conversación entre el público, fuera del alcance del paciente.
 * El agente no abre este canal, así que aquí se puede planear la intervención sin que
 * el sujeto lo lea. Es lo que hace posible la estrategia.
 */
export function usePasillo(identity: Identity): UsePasilloResult {
  const { messages, send } = useChannel<PasilloMessage>({
    channelId: CHANNEL_PASILLO,
    history: 80,
  });

  const entries = useMemo<PasilloEntry[]>(
    () =>
      toHistory<PasilloMessage>(
        messages.filter(
          (message): message is Message<PasilloMessage> =>
            !message.ephemeral && !message.retracted && Boolean(message.content?.body),
        ),
      ).map((entry) => ({ id: entry.id, at: entry.at, message: entry.content })),
    [messages],
  );

  const publish = useCallback(
    async (body: string): Promise<string | null> => {
      const trimmed = body.trim();
      const check = checkPasilloBody(trimmed);
      if (!check.ok) return check.reason;

      try {
        await send({
          content: { nickname: identity.nickname, color: identity.color, body: trimmed },
        });
        return null;
      } catch (error) {
        return rejectionReason(error, "No se pudo enviar al pasillo.");
      }
    },
    [send, identity],
  );

  return { entries, send: publish };
}
