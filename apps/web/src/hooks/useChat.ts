import { useCallback, useEffect, useMemo } from "react";
import { useChannel } from "@portalsdk/react";
import type { ChannelStatus, Message } from "@portalsdk/core";
import {
  ACTIVITY_THINKING,
  CHANNEL_CHAT,
  checkChatBody,
  type ChatMessage,
  type Identity,
} from "@el-paciente/shared";
import { rejectionReason, toHistory } from "../lib/portal-message";

export interface ChatEntry {
  id: string;
  at: number;
  message: ChatMessage;
}

export interface UseChatResult {
  entries: ChatEntry[];
  presenceCount: number;
  status: ChannelStatus;
  /** Nicknames de quien está escribiendo, ya resueltos desde la presencia. */
  typingNicknames: string[];
  /** EL PACIENTE está pensando de verdad: lo anuncia él, no lo deducimos. */
  patientThinking: boolean;
  send: (body: string) => Promise<string | null>;
  notifyTyping: () => void;
}

export function useChat(identity: Identity): UseChatResult {
  const { messages, presence, status, typing, activity, send, sendTyping, setMetadata, me } =
    useChannel<ChatMessage>({
      channelId: CHANNEL_CHAT,
      history: 60,
      // La presencia lleva nuestro nombre para poder resolver quién teclea: en un canal
      // anónimo, `typing` solo devuelve ids de usuario.
      metadata: { nickname: identity.nickname, color: identity.color },
    });

  useEffect(() => {
    setMetadata({ nickname: identity.nickname, color: identity.color });
  }, [setMetadata, identity]);

  const entries = useMemo<ChatEntry[]>(
    () =>
      toHistory<ChatMessage>(
        messages.filter(
          (message): message is Message<ChatMessage> =>
            !message.ephemeral && !message.retracted && Boolean(message.content?.role),
        ),
      ).map((entry) => ({ id: entry.id, at: entry.at, message: entry.content })),
    [messages],
  );

  /** id de usuario → nickname, tomado de la metadata de presencia. */
  const nicknameById = useMemo(() => {
    const index = new Map<string, string>();
    if (presence?.kind === "detailed") {
      for (const participant of presence.participants) {
        const nickname = participant.metadata?.nickname;
        if (typeof nickname === "string" && nickname) index.set(participant.id, nickname);
      }
    }
    return index;
  }, [presence]);

  const typingNicknames = useMemo(
    () =>
      typing
        .filter((userId) => userId !== me?.id)
        .map((userId) => nicknameById.get(userId) ?? "alguien"),
    [typing, nicknameById, me],
  );

  const publish = useCallback(
    async (body: string): Promise<string | null> => {
      const trimmed = body.trim();
      const check = checkChatBody(trimmed);
      if (!check.ok) return check.reason;

      try {
        await send({
          content: {
            role: "human",
            nickname: identity.nickname,
            color: identity.color,
            body: trimmed,
          },
        });
        return null;
      } catch (error) {
        return rejectionReason(error, "El paciente no ha podido oírte.");
      }
    },
    [send, identity],
  );

  // Solo el agente emite "thinking"; el público emite "typing". Basta con el tipo.
  const patientThinking = useMemo(
    () => activity.some((entry) => entry.kind === ACTIVITY_THINKING),
    [activity],
  );

  return {
    entries,
    presenceCount: presence?.count ?? 0,
    status,
    typingNicknames,
    patientThinking,
    send: publish,
    notifyTyping: sendTyping,
  };
}
