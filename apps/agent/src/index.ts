import {
  CHANNEL_BRAIN,
  CHANNEL_CHAT,
  SEED_SLOTS,
  reduceBrain,
  slotDef,
  type BrainMessage,
  type ChatMessage,
  type LogEntry,
} from "@el-paciente/shared";
import type { Message } from "@portalsdk/core";
import { isLive, openChannel, readHistory, signed } from "./portal-client.ts";
import { buildTurn, parseReply } from "./prompt.ts";
import { complete } from "./llm.ts";

/** Respiro mínimo entre turnos: evita que se pise a sí mismo y protege el presupuesto. */
const MIN_TURN_GAP_MS = 2000;
/** Ventana en la que varias ediciones seguidas se agrupan en una sola reacción. */
const COALESCE_MS = 1200;
/** Margen para que Portal entregue el backfill antes de decidir si hay que sembrar. */
const BOOT_GRACE_MS = 2500;

const reset = process.argv.includes("--reset");

const chat = openChannel<ChatMessage>(CHANNEL_CHAT, 60);
const brain = openChannel<BrainMessage>(CHANNEL_BRAIN, 200);

/** Todo lo anterior a este instante es pasado: no se reacciona al historial. */
let bootAt = Number.POSITIVE_INFINITY;
const reactedTo = new Set<string>();

let pendingTriggers: LogEntry[] = [];
let humanSpoke = false;
let busy = false;
let lastTurnAt = 0;
let coalesceTimer: ReturnType<typeof setTimeout> | undefined;

async function main() {
  console.log("EL PACIENTE despierta. Conectando al quirófano…");

  chat.on("message", onChatMessage);
  brain.on("message", onBrainMessage);

  await delay(BOOT_GRACE_MS);
  await bootstrap();

  console.log("Escuchando. Ctrl+C para dormirlo.");
}

/** Siembra el cerebro solo si la sala está virgen, o si nos lo piden con --reset. */
async function bootstrap() {
  const virgin = readHistory<BrainMessage>(brain).length === 0;

  if (reset || virgin) {
    await brain.send({ content: signed({ kind: "seed", slots: SEED_SLOTS }) });
    console.log(reset ? "Cerebro restaurado al valor de fábrica." : "Cerebro sembrado.");
  }

  bootAt = Date.now();

  if (reset) {
    await say("Me han hecho un lavado. No recuerdo a ninguno de ustedes. Es un alivio.", true);
  }
}

function onChatMessage(message: Message<ChatMessage>) {
  if (!isLive(message) || message.timestamp < bootAt) return;
  // Ignoramos nuestra propia voz y los avisos clínicos: si no, hablaría solo.
  if (message.content?.role !== "human") return;

  humanSpoke = true;
  scheduleTurn();
}

function onBrainMessage(message: Message<BrainMessage>) {
  if (!isLive(message) || message.timestamp < bootAt) return;
  if (message.content?.kind !== "edit") return;
  if (reactedTo.has(message.id)) return;
  reactedTo.add(message.id);

  const { log } = reduceBrain(readHistory<BrainMessage>(brain));
  const entry = log.find((item) => item.id === message.id);
  if (!entry) return;

  pendingTriggers.push(entry);
  void announceEdit(entry);
  scheduleTurn();
}

/** El aviso clínico en el chat. Lo publica solo el agente para que no salga duplicado. */
async function announceEdit(entry: LogEntry) {
  const label = slotDef(entry.slot)?.label ?? entry.slot;
  try {
    await chat.send({
      content: signed({
        role: "system",
        body: `${entry.nickname} editó ${label} de EL PACIENTE`,
      }),
    });
  } catch (error) {
    console.warn("[chat] no pude anunciar la edición:", describe(error));
  }
}

/** Agrupa ráfagas: diez ediciones seguidas producen una reacción, no diez. */
function scheduleTurn(delayMs = COALESCE_MS) {
  clearTimeout(coalesceTimer);
  coalesceTimer = setTimeout(() => void runTurn(), delayMs);
}

async function runTurn() {
  if (busy) {
    scheduleTurn();
    return;
  }
  if (!humanSpoke && pendingTriggers.length === 0) return;

  const sinceLast = Date.now() - lastTurnAt;
  if (sinceLast < MIN_TURN_GAP_MS) {
    scheduleTurn(MIN_TURN_GAP_MS - sinceLast);
    return;
  }

  busy = true;
  const triggers = pendingTriggers;
  pendingTriggers = [];
  humanSpoke = false;

  try {
    const brainState = reduceBrain(readHistory<BrainMessage>(brain));
    const chatHistory = readHistory<ChatMessage>(chat)
      .map((entry) => entry.content)
      .filter((message): message is ChatMessage => Boolean(message?.role));

    const raw = await complete(
      buildTurn({ brain: brainState, chat: chatHistory, trigger: triggers }),
    );
    const { body, crisis } = parseReply(raw);
    if (body) await say(body, crisis);
  } catch (error) {
    console.error("[turno] falló:", describe(error));
    // Que no se congele la demo: un silencio clínico es mejor que una pantalla muerta.
    await say("…", false).catch(() => {});
  } finally {
    busy = false;
    lastTurnAt = Date.now();
    if (humanSpoke || pendingTriggers.length > 0) scheduleTurn();
  }
}

async function say(body: string, crisis: boolean) {
  await chat.send({ content: signed({ role: "ai", body, crisis }) });
  console.log(`${crisis ? "[EPISODIO] " : ""}${body}`);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

process.on("SIGINT", () => {
  console.log("\nEL PACIENTE se duerme.");
  chat.release();
  brain.release();
  process.exit(0);
});

main().catch((error) => {
  console.error("El agente no pudo arrancar:", describe(error));
  process.exit(1);
});
