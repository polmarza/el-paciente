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
import type { ChannelHandle, Message } from "@portalsdk/core";
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
/**
 * Techo de espera al backfill del canal `brain` antes de arrancar de todos modos.
 * Es un backstop, no el mecanismo principal: `waitReady` espera el evento `status`
 * ("ready") de Portal, que es la señal real de que el histórico ya llegó. Antes se
 * esperaba un tiempo fijo (2.5 s) y, si el backfill tardaba más — como pasó una vez en
 * producción —, `bootstrap` encontraba el canal vacío, daba la sala por virgen y
 * sembraba una ronda nueva encima de una partida en curso.
 */
const BOOT_TIMEOUT_MS = 8000;
/**
 * Frenos para las peticiones de paciente nuevo. Cualquiera puede pedirla desde la
 * cabecera, así que el agente es quien decide: no atiende si la ronda acaba de empezar
 * (alguien reventaría la partida de otros nada más arrancar) ni si acaba de haber un
 * reinicio (evita que se pueda usar en ráfaga).
 */
const NEW_GAME_MIN_ROUND_MS = 45_000;
const NEW_GAME_COOLDOWN_MS = 60_000;

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
let lastNewGameAt = 0;

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

  // Sin esto, un backfill lento vale como sala virgen: sembraría una ronda encima de
  // una partida ya en marcha, que es justo el bug que dejó este comentario aquí.
  await waitReady(brain);
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
      caso: round.caso,
    }),
  });
  console.log(`\n── Ronda "${round.id}" · secreto: ${round.secret} ──`);
}

/** Cierra la ronda, publica el secreto (ya sin valor) y programa la siguiente. */
async function endRound(outcome: "revelado" | "paro" | "retirado", by?: string) {
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

  const duracion = Math.round((Date.now() - roundStartedAt) / 1000);
  console.log(
    outcome === "revelado"
      ? `── @${by} le sacó "${round.secret}" en ${duracion}s ──`
      : outcome === "retirado"
        ? `── Retirado a petición de @${by}. El secreto era "${round.secret}". ──`
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

  if (content?.kind === "new-game") {
    void handleNewGameRequest(content.nickname);
    return;
  }

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

/** Atiende —o rechaza— una petición de paciente nuevo, siempre en voz alta. */
async function handleNewGameRequest(nickname: string) {
  const now = Date.now();

  if (intermission) return;
  if (now - roundStartedAt < NEW_GAME_MIN_ROUND_MS) {
    await announce(`${nickname} pidió un paciente nuevo, pero este acaba de llegar.`);
    return;
  }
  if (now - lastNewGameAt < NEW_GAME_COOLDOWN_MS) {
    await announce(`${nickname} pidió otro paciente. Habrá que esperar un poco.`);
    return;
  }

  lastNewGameAt = now;
  await announce(`${nickname} pidió un paciente nuevo. Se lo llevan.`);
  await endRound("retirado", nickname);
}

/** Un aviso clínico en el chat, con la firma del agente. */
async function announce(body: string) {
  await chat.send({ content: signed({ role: "system", body }) }).catch((error) => {
    console.warn("[chat] no pude anunciar:", describe(error));
  });
}

async function flatline() {
  await say("—", false).catch(() => {});
  await endRound("paro");
}

/** El aviso clínico en el chat. Lo publica solo el agente para que no salga duplicado. */
async function announceEdit(entry: LogEntry) {
  const label = slotDef(entry.slot)?.label ?? entry.slot;
  await announce(`${entry.nickname} editó ${label} de EL PACIENTE`);
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
    // Solo la conversación de ESTE paciente. Sin este filtro heredaba la del anterior y
    // acababa hablando del secreto de la ronda pasada como si fuera suyo.
    const chatHistory = readHistory<ChatMessage>(chat)
      .filter((entry) => entry.at >= roundStartedAt)
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

/**
 * Espera a que el canal termine su backfill (`status === "ready"`) antes de decidir si
 * la sala está virgen. Con un techo: si Portal nunca llega a "ready" (red caída, clave
 * mala), el agente arranca igual en vez de quedarse dormido para siempre — el resto del
 * arranque ya sabe manejar una sala que resulta estar vacía de verdad.
 */
function waitReady(channel: ChannelHandle<unknown>): Promise<void> {
  if (channel.status === "ready") return Promise.resolve();
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve();
    }, BOOT_TIMEOUT_MS);
    const unsubscribe = channel.on("status", (status) => {
      if (status !== "ready") return;
      clearTimeout(timeout);
      unsubscribe();
      resolve();
    });
  });
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
