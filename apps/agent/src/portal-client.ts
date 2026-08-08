import { Portal, type ChannelHandle, type Message } from "@portalsdk/core";
import type { HistoryEntry } from "@el-paciente/shared";
import { env } from "./env.ts";

/**
 * EL PACIENTE se conecta a Portal como un cliente más: Portal no expone una API REST
 * para publicar desde un servidor, así que el agente vive del mismo WebSocket que la
 * audiencia. Su privilegio no es el transporte, es el `secret` que el middleware verifica.
 */
export const portal = new Portal({ apiKey: env.portalApiKey });

/** Firma un mensaje como propio del agente. El middleware valida y elimina el secreto. */
export function signed<T extends object>(content: T): T & { secret: string } {
  return { ...content, secret: env.agentSecret };
}

export function openChannel<M>(id: string, history: number): ChannelHandle<M> {
  const channel = portal.channel<M>(id, { history });
  channel.acquire();
  return channel;
}

/** Los mensajes persistentes del canal, en la forma que consumen los reducers. */
export function readHistory<M>(channel: ChannelHandle<M>): HistoryEntry<M>[] {
  return channel.messages.filter(isLive).map(toEntry);
}

export function isLive<M>(message: Message<M>): boolean {
  return !message.ephemeral && !message.retracted;
}

export function toEntry<M>(message: Message<M>): HistoryEntry<M> {
  return { id: message.id, content: message.content, at: message.timestamp };
}
