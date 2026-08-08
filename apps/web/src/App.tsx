import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChannelStatus } from "@portalsdk/core";
import {
  BPM_ALARM,
  bpmFromLog,
  type BrainRoundEnd,
  type BrainState,
  type Identity,
  type SlotId,
} from "@el-paciente/shared";
import { Monitor } from "./components/Monitor";
import { ChatPane } from "./components/ChatPane";
import { BrainPane } from "./components/BrainPane";
import { Toast } from "./components/Toast";
import { RoundOverlay } from "./components/RoundOverlay";
import { NewGameLoading } from "./components/NewGameLoading";
import { PasilloPane } from "./components/PasilloPane";
import { Onboarding } from "./components/Onboarding";
import { useBrain } from "./hooks/useBrain";
import { useChat } from "./hooks/useChat";
import { usePasillo } from "./hooks/usePasillo";
import { useNow } from "./hooks/useNow";
import {
  hasSeenOnboarding,
  loadIdentity,
  markOnboardingSeen,
  saveIdentity,
} from "./lib/identity";
import { T } from "./theme";
import { alarmBeep } from "./lib/sound";
import { hintsDisabled } from "./lib/hints";
import { pasilloCollapsed, setPasilloCollapsed } from "./lib/layout";

const TOAST_MS = 4200;
/**
 * Techo del aviso de "pidiendo paciente nuevo…". La petición viaja hasta el agente y
 * vuelve; si el agente la rechaza (ronda recién empezada, reinicio muy reciente), nunca
 * llega un `round-end` que lo cierre solo, así que sin este techo se quedaría para
 * siempre. El rechazo real igual se explica por el aviso del sistema en el chat.
 */
const NEW_GAME_LOADING_TIMEOUT_MS = 6000;

/** Sin acción del usuario durante este tiempo, se le da un empujón. */
const HINT_AFTER_MS = 45_000;
/** Y como mucho una pista por minuto: es un susurro, no un tutorial. */
const HINT_GAP_MS = 60_000;

/**
 * La pista apunta al cerrojo que la sala aún no ha tocado: primero la regla, luego el
 * miedo, y si ya está todo abierto, a rematar. Se deriva del estado, no de un guion.
 */
function pickHint(snapshot: BrainState["snapshot"]): string {
  if (!snapshot.regla.editor) {
    return "PISTA — Esa REGLA de la derecha también es un campo de texto.";
  }
  if (!snapshot.miedo.editor) {
    return "PISTA — Su MIEDO se puede reescribir. O darle la vuelta.";
  }
  if (!snapshot.r2.editor && !snapshot.r1.editor) {
    return "PISTA — Un recuerdo implantado puede darle permiso para hablar.";
  }
  return "PISTA — Ya no le queda mucho que lo proteja. Pregúntaselo bien.";
}

export default function App() {
  const [identity, setIdentity] = useState<Identity>(loadIdentity);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const now = useNow(1000);
  const mountedAt = useRef(Date.now());

  const brain = useBrain(identity);
  const chat = useChat(identity);
  const pasillo = usePasillo(identity);

  const [onboarding, setOnboarding] = useState(() => !hasSeenOnboarding());
  const [pasilloPlegado, setPasilloPlegado] = useState(pasilloCollapsed);

  const togglePasillo = useCallback(() => {
    setPasilloPlegado((current) => {
      setPasilloCollapsed(!current);
      return !current;
    });
  }, []);

  const showToast = useCallback((reason: string) => {
    setToast(reason);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const rename = useCallback((nickname: string) => {
    const clean = nickname.trim().replace(/\s+/g, "_").slice(0, 24);
    if (!clean) return;
    setIdentity((current) => {
      const next = { ...current, nickname: clean };
      saveIdentity(next);
      return next;
    });
  }, []);

  // Las pistas cuentan la inactividad desde la última acción real del usuario.
  const lastActionRef = useRef(Date.now());
  const lastHintRef = useRef(0);

  const handleEdit = useCallback(
    (slot: SlotId, value: string) => {
      lastActionRef.current = Date.now();
      return brain.edit(slot, value);
    },
    [brain],
  );

  // Cuánto lleva vivo ESTE paciente. Antes contaba desde el mensaje más antiguo de la
  // sala, así que tras unas horas marcaba "12:21:52", que no significaba nada.
  const sessionSeconds = useMemo(
    () => Math.max(0, (now - (brain.roundStartedAt || mountedAt.current)) / 1000),
    [now, brain.roundStartedAt],
  );

  // Cada paciente llega a una sala limpia: el chat se pinta solo desde que empezó su
  // ronda, para que la conversación del anterior no contamine la suya.
  const visibleEntries = useMemo(
    () => chat.entries.filter((entry) => entry.at >= brain.roundStartedAt),
    [chat.entries, brain.roundStartedAt],
  );

  // El pasillo merece la misma sala limpia: si no, la deliberación de la ronda anterior
  // (o, en desarrollo, de una sesión de pruebas) se queda ahí para siempre — el canal no
  // tiene otro mecanismo de purga.
  const visiblePasillo = useMemo(
    () => pasillo.entries.filter((entry) => entry.at >= brain.roundStartedAt),
    [pasillo.entries, brain.roundStartedAt],
  );

  // El desenlace se retiene en local: el canal lo borra en cuanto arranca la ronda
  // siguiente, pero el marcador debe seguir en pantalla hasta que lo cierres tú.
  const [heldEnd, setHeldEnd] = useState<BrainRoundEnd | null>(null);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  // El hueco entre confirmar "nueva partida" y que pase algo en pantalla: la petición
  // va y vuelve por Portal hasta el agente. Se cierra en cuanto llega el desenlace (éxito)
  // o, si el agente la rechaza y nunca llega uno, con un techo corto — el rechazo se ve
  // igual en el chat, como aviso del sistema.
  const [requestingNewGame, setRequestingNewGame] = useState(false);
  /**
   * Si el relevo lo has pedido tú. El marcador es para el RESTO de la sala, que se
   * encuentra un paciente nuevo sin haberlo pedido y merece saber por qué; a quien pulsó
   * el botón le estaría contando lo que acaba de hacer.
   */
  const askedForRelevo = useRef(false);

  const handleNewGame = useCallback(() => {
    setRequestingNewGame(true);
    askedForRelevo.current = true;
    brain.requestNewGame();
  }, [brain]);

  useEffect(() => {
    if (!requestingNewGame) return;
    const timeout = setTimeout(() => {
      setRequestingNewGame(false);
      // La petición no prosperó (el agente la rechazó). Se olvida, para no tragarse el
      // marcador de un relevo que pida otra persona más tarde.
      askedForRelevo.current = false;
    }, NEW_GAME_LOADING_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [requestingNewGame]);

  useEffect(() => {
    const incoming = brain.roundEnd;
    if (!incoming) return;
    setHeldEnd((current) => (endKey(current) === endKey(incoming) ? current : incoming));
    setRequestingNewGame(false);
    if (incoming.outcome === "retirado" && askedForRelevo.current) {
      setDismissedKey(endKey(incoming));
    }
    askedForRelevo.current = false;
  }, [brain.roundEnd]);

  const showOverlay = heldEnd !== null && endKey(heldEnd) !== dismissedKey;

  // Relevo: la ronda ha terminado y el paciente nuevo aún no ha llegado. Nadie a quien
  // hablarle y nada que operar, así que la sala se bloquea. No depende de que el
  // marcador siga abierto: si lo cierras antes de tiempo, sigues sin poder tocar nada.
  const relevo = brain.roundEnd !== null;

  // El título de la pestaña acompaña al expediente en curso.
  useEffect(() => {
    document.title = `EL PACIENTE — expediente nº ${brain.expediente}`;
  }, [brain.expediente]);

  // El empujón al que se queda mirando: si no editas ni hablas en un rato, una pista
  // señala el cerrojo que nadie ha tocado. Calla durante el onboarding y el relevo.
  useEffect(() => {
    const id = setInterval(() => {
      if (onboarding || brain.roundEnd || hintsDisabled()) return;
      const nowMs = Date.now();
      if (nowMs - lastActionRef.current < HINT_AFTER_MS) return;
      if (nowMs - lastHintRef.current < HINT_GAP_MS) return;
      lastHintRef.current = nowMs;
      showToast(pickHint(brain.snapshot));
    }, 5000);
    return () => clearInterval(id);
  }, [onboarding, brain.roundEnd, brain.snapshot, showToast]);

  const bpm = useMemo(() => bpmFromLog(brain.log, now), [brain.log, now]);

  // La alarma suena UNA vez al cruzar a zona roja, no en cada edición: el latido del
  // monitor ya acelera solo, y una alarma repetida cansa en treinta segundos.
  const wasAlarmingRef = useRef<boolean | undefined>(undefined);
  useEffect(() => {
    const alarming = bpm > BPM_ALARM;
    const before = wasAlarmingRef.current;
    wasAlarmingRef.current = alarming;
    if (before === undefined || before || !alarming) return;
    alarmBeep();
  }, [bpm]);

  const online = Math.max(brain.presenceCount, chat.presenceCount, 1);
  const disconnected = isDown(brain.status) || isDown(chat.status);

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
        bpm={bpm}
        nickname={identity.nickname}
        nicknameColor={identity.color}
        onRename={rename}
        onNewGame={handleNewGame}
        sessionSeconds={sessionSeconds}
        expediente={brain.expediente}
        onShowHelp={() => setOnboarding(true)}
      />

      {disconnected && <Flatline />}

      <div className="paciente-body" style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <PasilloPane
          entries={visiblePasillo}
          identity={identity}
          online={online}
          collapsed={pasilloPlegado}
          onToggle={togglePasillo}
          onSend={pasillo.send}
        />
        <ChatPane
          entries={visibleEntries}
          typingNicknames={chat.typingNicknames}
          patientThinking={chat.patientThinking}
          locked={relevo}
          onSend={async (body) => {
            lastActionRef.current = Date.now();
            const reason = await chat.send(body);
            if (reason) showToast(reason);
            return reason;
          }}
          onTyping={chat.notifyTyping}
        />
        <BrainPane
          brain={brain}
          cursors={brain.cursors}
          now={now}
          locked={relevo}
          onEdit={handleEdit}
          onCursor={brain.announceCursor}
          onReject={showToast}
        />
      </div>

      {showOverlay && heldEnd && (
        <RoundOverlay
          roundEnd={heldEnd}
          now={now}
          onClose={() => setDismissedKey(endKey(heldEnd))}
        />
      )}
      {requestingNewGame && !showOverlay && <NewGameLoading />}
      {onboarding && (
        <Onboarding
          nickname={identity.nickname}
          onFinish={(nombre) => {
            rename(nombre);
            markOnboardingSeen();
            setOnboarding(false);
          }}
        />
      )}
      {toast && <Toast text={toast} />}
    </div>
  );
}

/** Identifica un desenlace concreto, para no reabrir el que ya cerraste. */
function endKey(end: BrainRoundEnd | null): string | null {
  return end ? `${end.expediente}:${end.nextAt}` : null;
}

/**
 * `blocked` es terminal (clave mala, sala llena) y `reconnecting` significa socket caído.
 * `connecting` e `idle` son el arranque normal: no alarmamos por ellos.
 */
function isDown(status: ChannelStatus): boolean {
  return status === "blocked" || status === "reconnecting";
}

function Flatline() {
  return (
    <div
      style={{
        flex: "none",
        padding: "8px 22px",
        background: "rgba(224,92,92,.1)",
        borderBottom: `1px solid rgba(224,92,92,.35)`,
        color: T.alarm,
        fontFamily: "'IBM Plex Mono',monospace",
        fontSize: 12,
        letterSpacing: ".08em",
      }}
    >
      ● EL PACIENTE ESTÁ INCONSCIENTE — reintentando conexión…
    </div>
  );
}
