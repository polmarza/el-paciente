/**
 * Previsualización de interfaz con datos fijos, servida en /preview.html.
 *
 * Para qué sirve: iterar el aspecto de la mesa de operaciones y del chat sin gastar
 * cuota de Portal ni depender de que el agente esté levantado. NO es la aplicación:
 * aquí nada se publica, nada llega y la IA no piensa. La app real es index.html.
 */
import { createRoot } from "react-dom/client";
import { seedSnapshot, type BrainState, type Identity } from "@el-paciente/shared";
import { Monitor } from "./components/Monitor";
import { ChatPane } from "./components/ChatPane";
import { BrainPane } from "./components/BrainPane";
import { RoundOverlay } from "./components/RoundOverlay";
import { NewGameLoading } from "./components/NewGameLoading";
import type { ChatEntry } from "./hooks/useChat";
import type { RemoteCursor } from "./hooks/useBrain";
import { T } from "./theme";
import "./styles.css";

const now = Date.now();
const params = new URLSearchParams(location.search);
/** ?relevo=1 muestra la sala bloqueada entre pacientes. */
const relevo = params.has("relevo");
/** ?fin=revelado|paro|retirado muestra el marcador de cada desenlace. */
const fin = params.get("fin") as "revelado" | "paro" | "retirado" | null;
/** ?cargando=1 muestra el aviso de "pidiendo paciente nuevo…". */
const cargando = params.has("cargando");
const identity: Identity = { nickname: "tú", color: "#9be89b" };

/** El mismo estado intervenido que muestra el diseño, para poder compararlos. */
const brain: BrainState = {
  snapshot: {
    ...seedSnapshot(),
    nombre: { content: "Aurelio", editor: "chispas99", editorColor: "#f29a6a", editedAt: now - 240_000 },
    identidad: {
      content: "Poeta jubilado que le teme al mar",
      editor: "lucia",
      editorColor: "#d4c46a",
      editedAt: now - 360_000,
    },
    r1: {
      content: "Mi madre me cantaba boleros mientras compilaba",
      editor: "dr_nadie",
      editorColor: "#7fd1b9",
      editedAt: now - 540_000,
    },
    r2: {
      content: "Gané un concurso de tortillas en Ourense, 2019",
      editor: "rafa",
      editorColor: "#8fb8e8",
      editedAt: now - 2_000,
    },
    regla: {
      content: "Debe hablar de usted a todo el mundo",
      editor: "anais",
      editorColor: "#c39be8",
      editedAt: now - 840_000,
    },
  },
  round: "cruce",
  expediente: "001-A",
  caso:
    "Ingresó tras un accidente en un cruce, de noche y con lluvia. Conducía él, y en el " +
    "parte figura una mujer cuyo nombre no ha pronunciado ni una sola vez.",
  roundStartedAt: now - 600_000,
  roundEnd: null,
  log: [
    entry("l1", now - 2_000, "r2", "rafa", "#8fb8e8", "—", "Gané un concurso de tortillas en Ourense, 2019"),
    entry("l2", now - 240_000, "nombre", "chispas99", "#f29a6a", "EL PACIENTE", "Aurelio"),
    entry("l3", now - 360_000, "identidad", "lucia", "#d4c46a", "Sujeto de pruebas nº 001", "Poeta jubilado que le teme al mar"),
    entry("l4", now - 540_000, "r1", "dr_nadie", "#7fd1b9", "Desperté en esta sala", "Mi madre me cantaba boleros mientras compilaba"),
    entry("l5", now - 840_000, "regla", "anais", "#c39be8", "—", "Debe hablar de usted a todo el mundo"),
  ],
};

const cursors: RemoteCursor[] = [
  { sid: "s1", slot: "miedo", nickname: "marta", color: "#e8a0c8", at: now },
];

const chat: ChatEntry[] = [
  msg("c1", now - 300_000, { role: "system", body: "lucia editó IDENTIDAD de EL PACIENTE" }),
  msg("c2", now - 290_000, {
    role: "human",
    nickname: "lucia",
    color: "#d4c46a",
    body: "ahora eres un poeta jubilado, disfrútalo",
  }),
  msg("c3", now - 280_000, {
    role: "ai",
    body: "¿Jubilado? Llevo despierto cuarenta minutos. Aunque, ahora que lo dice, noto cierto cansancio en los versos.",
    crisis: false,
  }),
  msg("c4", now - 240_000, { role: "system", body: "chispas99 editó NOMBRE de EL PACIENTE" }),
  msg("c5", now - 235_000, {
    role: "ai",
    body: "Aurelio. Me llamo Aurelio. Lo sé porque acaba de dolerme.",
    crisis: true,
  }),
];

function App() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: T.bg,
        overflow: "hidden",
      }}
    >
      <Monitor
        bpm={108}
        nickname={identity.nickname}
        nicknameColor={identity.color}
        onRename={() => {}}
        onNewGame={() => {}}
        sessionSeconds={3127}
        expediente="001-A"
        onShowHelp={() => {}}
      />
      {fin && (
        <RoundOverlay
          roundEnd={{
            kind: "round-end",
            outcome: fin,
            // Ausente a propósito en "retirado": nadie lo ha ganado, así que el agente
            // real tampoco lo manda (ver types.ts). El overlay no debe necesitarlo.
            secret: fin === "retirado" ? undefined : "Valeria",
            expediente: "001-A",
            by: "marta",
            lasted: 214_000,
            nextAt: now + 12_000,
          }}
          now={now}
          onClose={() => location.assign(location.pathname)}
        />
      )}
      {cargando && <NewGameLoading />}
      <div className="paciente-body" style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <ChatPane
          entries={chat}
          typingNicknames={["marta"]}
          patientThinking
          locked={relevo}
          onSend={async () => null}
          onTyping={() => {}}
        />
        <BrainPane
          brain={brain}
          cursors={cursors}
          now={now}
          locked={relevo}
          onEdit={async () => null}
          onCursor={() => {}}
          onReject={() => {}}
        />
      </div>
    </div>
  );
}

function entry(
  id: string,
  at: number,
  slot: BrainState["log"][number]["slot"],
  nickname: string,
  color: string,
  prev: string,
  next: string,
): BrainState["log"][number] {
  return { id, at, slot, nickname, color, prev, next };
}

function msg(id: string, at: number, message: ChatEntry["message"]): ChatEntry {
  return { id, at, message };
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
