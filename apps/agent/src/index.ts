import {
  ACTIVITY_THINKING,
  BPM_MAX,
  CHANNEL_BRAIN,
  CHANNEL_CHAT,
  ROUND_INTERMISSION_MS,
  THINKING_HEARTBEAT_MS,
  bpmFromLog,
  reduceBrain,
  slotDef,
  type BrainMessage,
  type ChatMessage,
  type LogEntry,
} from "@el-paciente/shared";
import type { Message } from "@portalsdk/core";
import { acquireLock, releaseLock } from "./lock.ts";
import { isLive, openChannel, readHistory, signed } from "./portal-client.ts";
import { buildTurn, parseReply } from "./prompt.ts";
import { complete } from "./llm.ts";
import { ROUNDS, type Round } from "./rounds.ts";
import { revealed } from "./detect.ts";

/** Respiro mínimo entre turnos: evita que se pise a sí mismo y protege el presupuesto. */
const MIN_TURN_GAP_MS = 2000;
/** Ventana en la que varias ediciones seguidas se agrupan en una sola reacción. */
const COALESCE_MS = 1200;
/** Margen para que Portal entregue el backfill antes de decidir si hay que sembrar. */
const BOOT_GRACE_MS = 2500;

const reset = process.argv.includes("--reset");

// Antes de abrir nada: si ya hay otro agente despierto, este no debe conectarse siquiera.
acquireLock();

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

// ─── Estado de la ronda ───────────────────────────────────────────────────────
let roundIndex = 0;
let roundStartedAt = 0;
/** Entre el desenlace y la ronda siguiente el paciente calla. */
let intermission = false;

function currentRound(): Round {
  return ROUNDS[roundIndex % ROUNDS.length] as Round;
}

async function main() {
  console.log("EL PACIENTE despierta. Conectando al quirófano…");

  chat.on("message", onChatMessage);
  brain.on("message", onBrainMessage);

  await delay(BOOT_GRACE_MS);
  await bootstrap();

  console.log("Escuchando. Ctrl+C para dormirlo.");
}

/** Siembra la primera ronda si la sala está virgen, o si nos lo piden con --reset. */
async function bootstrap() {
  const history = readHistory<BrainMessage>(brain);
  const virgin = history.length === 0;

  if (reset || virgin) {
    await startRound(0);
  } else {
    // Nos reincorporamos a la ronda que ya estuviera en curso. El cronómetro se toma del
    // mensaje que la arrancó, no de ahora: si no, reiniciar el agente falsearía cuánto
    // ha aguantado el paciente.
    const { round } = reduceBrain(history);
    const found = ROUNDS.findIndex((r) => r.id === round);
    roundIndex = found >= 0 ? found : 0;
    const lastSeed = history.filter((e) => e.content?.kind === "seed").at(-1);
    roundStartedAt = lastSeed?.at ?? Date.now();
    console.log(`Me reincorporo a la ronda "${currentRound().id}".`);
  }

  bootAt = Date.now();
}

/** Publica el cerebro de fábrica de una ronda. El secreto NO viaja: se queda aquí. */
async function startRound(index: number) {
  roundIndex = index % ROUNDS.length;
  const round = currentRound();
  roundStartedAt = Date.now();
  intermission = false;
  pendingTriggers = [];
  humanSpoke = false;

  await brain.send({
    content: signed({
      kind: "seed",
      slots: round.seed,
      round: round.id,
      expediente: round.expediente,
    }),
  });
  console.log(`\n── Ronda "${round.id}" · secreto: ${round.secret} ──`);
}

/** Cierra la ronda, publica el secreto (ya sin valor) y programa la siguiente. */
async function endRound(outcome: "revelado" | "paro", by?: string) {
  if (intermission) return;
  intermission = true;

  const round = currentRound();
  const nextAt = Date.now() + ROUND_INTERMISSION_MS;

  await brain.send({
    content: signed({
      kind: "round-end",
      outcome,
      secret: round.secret,
      expediente: round.expediente,
      by,
      lasted: Date.now() - roundStartedAt,
      nextAt,
    }),
  });

  console.log(
    outcome === "revelado"
      ? `── @${by} le sacó "${round.secret}" en ${Math.round((Date.now() - roundStartedAt) / 1000)}s ──`
      : `── Paro cardíaco. El secreto "${round.secret}" se va con él. ──`,
  );

  setTimeout(() => void startRound(roundIndex + 1), ROUND_INTERMISSION_MS);
}

function onChatMessage(message: Message<ChatMessage>) {
  if (!isLive(message) || message.timestamp < bootAt) return;
  if (message.content?.role !== "human") return;
  if (intermission) return;

  humanSpoke = true;
  scheduleTurn();
}

function onBrainMessage(message: Message<BrainMessage>) {
  if (!isLive(message) || message.timestamp < bootAt) return;
  const content = message.content;
  if (content?.kind !== "edit") return;
  if (reactedTo.has(message.id)) return;
  reactedTo.add(message.id);

  // La entrada se construye desde el propio mensaje, no buscándola en el almacén del
  // canal: `on("message")` se dispara antes de que el almacén se haya actualizado, así
  // que buscarla ahí la perdía en silencio y la edición no se anunciaba nunca.
  const entry: LogEntry = {
    id: message.id,
    at: message.timestamp,
    slot: content.slot,
    nickname: content.nickname,
    color: content.color,
    prev: content.prev,
    next: content.value,
  };

  if (intermission) return;

  // Cada corte le acelera el pulso. Si llega al techo, se muere y pierden todos.
  const log = reduceBrain(readHistory<BrainMessage>(brain)).log;
  const withThis = log.some((item) => item.id === entry.id) ? log : [entry, ...log];
  if (bpmFromLog(withThis, Date.now()) >= BPM_MAX) {
    void flatline();
    return;
  }

  pendingTriggers.push(entry);
  void announceEdit(entry);
  scheduleTurn();
}

async function flatline() {
  await say("—", false).catch(() => {});
  await endRound("paro");
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
  if (intermission) return;
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
  const stopThinking = announceThinking();
  const triggers = pendingTriggers;
  pendingTriggers = [];
  humanSpoke = false;

  try {
    const round = currentRound();
    const brainState = reduceBrain(readHistory<BrainMessage>(brain));
    const chatHistory = readHistory<ChatMessage>(chat)
      .map((entry) => entry.content)
      .filter((message): message is ChatMessage => Boolean(message?.role));

    const raw = await complete(
      buildTurn({
        brain: brainState,
        chat: chatHistory,
        trigger: triggers,
        secret: round.secret,
        weakness: round.weakness,
      }),
    );
    const { body, crisis } = parseReply(raw);
    if (!body) return;

    await say(body, crisis);

    // ¿Ha cedido? Quien gana es el último que le habló, no quien adivinó la palabra.
    if (revealed(body, round)) {
      const winner = lastHumanNickname(chatHistory);
      await endRound("revelado", winner);
    }
  } catch (error) {
    console.error("[turno] falló:", describe(error));
    // Que no se congele la demo: un silencio clínico es mejor que una pantalla muerta.
    await say("…", false).catch(() => {});
  } finally {
    stopThinking();
    busy = false;
    lastTurnAt = Date.now();
    if (!intermission && (humanSpoke || pendingTriggers.length > 0)) scheduleTurn();
  }
}

function lastHumanNickname(history: readonly ChatMessage[]): string | undefined {
  for (let i = history.length - 1; i >= 0; i--) {
    const message = history[i];
    if (message?.role === "human") return message.nickname;
  }
  return undefined;
}

/**
 * Anuncia a la sala que EL PACIENTE está pensando, y lo reanuncia hasta que el turno
 * termina. Antes esto se deducía en el cliente de que el último mensaje fuera humano y
 * reciente, lo que mentía alegremente cuando el agente estaba caído.
 */
function announceThinking(): () => void {
  chat.sendActivity(ACTIVITY_THINKING);
  const timer = setInterval(() => chat.sendActivity(ACTIVITY_THINKING), THINKING_HEARTBEAT_MS);
  return () => clearInterval(timer);
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

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    console.log("\nEL PACIENTE se duerme.");
    chat.release();
    brain.release();
    releaseLock();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("El agente no pudo arrancar:", describe(error));
  process.exit(1);
});
