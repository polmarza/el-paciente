import { allow, block, defineConfig, defineMiddleware, env, mask } from "@portalsdk/config";
import {
  CHANNEL_BRAIN,
  CHANNEL_CHAT,
  CHANNEL_PASILLO,
  SLOT_COOLDOWN_MS,
  USER_CHAT_COOLDOWN_MS,
  USER_EDIT_COOLDOWN_MS,
  USER_PASILLO_COOLDOWN_MS,
  checkChatBody,
  checkPasilloBody,
  checkSlotValue,
  cooldownReason,
  isSlotId,
  type BrainMessage,
  type ChatMessage,
  type PasilloMessage,
} from "@el-paciente/shared";

/**
 * Config server-side de EL PACIENTE.
 *
 * Aquí viven las dos garantías que no pueden estar en el navegador:
 *  1. Nadie puede hacerse pasar por la IA (patrón secreto + mask).
 *  2. Los cooldowns que impiden que la mente degenere en ruido.
 *
 * Nota honesta sobre los cooldowns: Portal no documenta almacenamiento persistente
 * para el middleware, así que el registro de tiempos vive en memoria del proceso que
 * ejecuta estos callbacks. Con una sola sala y una demo de una hora es suficiente; si
 * Portal reparte las invocaciones entre varias instancias, algún cooldown se colará.
 * Es una defensa anti-gamberro, no de seguridad: las reglas que sí son de seguridad
 * (el secreto y los límites de longitud) no dependen de ningún estado.
 */

const lastEditBySlot = new Map<string, number>();
const lastEditByUser = new Map<string, number>();
const lastChatByUser = new Map<string, number>();

/**
 * Solo el agente conoce esta firma. Se registra con `portal secrets set AGENT_SECRET`.
 * Ojo: el campo se llama `auth`, no `secret`. `secret` es el secreto de la ronda, que sí
 * debe llegar a los clientes cuando la ronda termina.
 */
function isAgent(content: { auth?: string } | undefined): boolean {
  const expected = env("AGENT_SECRET");
  return Boolean(expected && content?.auth && content.auth === expected);
}

const moderateChat = defineMiddleware<ChatMessage>("publish", (ctx) => {
  const content = ctx.message.content;

  if (content?.role === "ai" || content?.role === "system") {
    if (!isAgent(content)) {
      return block("Solo EL PACIENTE puede hablar con su propia voz.");
    }
    // La firma nunca debe llegar a los navegadores.
    const { auth: _auth, ...clean } = content;
    return mask<ChatMessage>(clean as ChatMessage);
  }

  if (content?.role !== "human") return block("Tipo de mensaje desconocido.");

  const check = checkChatBody(content.body);
  if (!check.ok) return block(check.reason);

  const now = Date.now();
  const last = lastChatByUser.get(ctx.sender.id) ?? 0;
  if (now - last < USER_CHAT_COOLDOWN_MS) {
    return block("Deje respirar al paciente un segundo.");
  }
  lastChatByUser.set(ctx.sender.id, now);

  return allow();
});

const moderateBrain = defineMiddleware<BrainMessage>("publish", (ctx) => {
  const content = ctx.message.content;

  // Los cursores son efímeros y puro adorno: no tocan la mente de nadie.
  if ((content as { kind?: string })?.kind === "cursor") return allow();

  // El arranque de ronda y su desenlace solo los publica el agente. El desenlace lleva el
  // secreto, que hasta ese momento no ha existido fuera de su proceso.
  if (content?.kind === "seed" || content?.kind === "round-end") {
    if (!isAgent(content)) return block("Solo EL PACIENTE decide cuándo empieza y acaba.");
    const { auth: _auth, ...clean } = content as { auth?: string };
    return mask<BrainMessage>(clean as BrainMessage);
  }

  if (content?.kind !== "edit") return block("Tipo de mensaje desconocido.");
  if (!isSlotId(content.slot)) return block("Esa región no existe en esta mente.");

  const check = checkSlotValue(content.value);
  if (!check.ok) return block(check.reason);

  const now = Date.now();

  const slotLast = lastEditBySlot.get(content.slot) ?? 0;
  const slotElapsed = now - slotLast;
  if (slotElapsed < SLOT_COOLDOWN_MS) {
    return block(cooldownReason(Math.ceil((SLOT_COOLDOWN_MS - slotElapsed) / 1000)));
  }

  const userLast = lastEditByUser.get(ctx.sender.id) ?? 0;
  if (now - userLast < USER_EDIT_COOLDOWN_MS) {
    return block("Una intervención cada vez. Deje sitio a los demás.");
  }

  lastEditBySlot.set(content.slot, now);
  lastEditByUser.set(ctx.sender.id, now);
  return allow();
});

const lastPasilloByUser = new Map<string, number>();

/**
 * El pasillo no lo lee el agente, así que aquí no hay nada que suplantar: solo se
 * controla la longitud y que nadie inunde la columna.
 */
const moderatePasillo = defineMiddleware<PasilloMessage>("publish", (ctx) => {
  const content = ctx.message.content;
  const check = checkPasilloBody(content?.body);
  if (!check.ok) return block(check.reason);

  const now = Date.now();
  const last = lastPasilloByUser.get(ctx.sender.id) ?? 0;
  if (now - last < USER_PASILLO_COOLDOWN_MS) return block("Más despacio en el pasillo.");
  lastPasilloByUser.set(ctx.sender.id, now);

  return allow();
});

export default defineConfig({
  channels: {
    [CHANNEL_CHAT]: { anonymous: true, onPublish: [moderateChat] },
    [CHANNEL_BRAIN]: { anonymous: true, onPublish: [moderateBrain] },
    [CHANNEL_PASILLO]: { anonymous: true, onPublish: [moderatePasillo] },
  },
});
