import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChannelStatus } from "@portalsdk/core";
import {
  bpmFromLog,
  type BrainRoundEnd,
  type Identity,
  type SlotId,
} from "@el-paciente/shared";
import { Monitor } from "./components/Monitor";
import { ChatPane } from "./components/ChatPane";
import { BrainPane } from "./components/BrainPane";
import { Toast } from "./components/Toast";
import { RoundOverlay } from "./components/RoundOverlay";
import { useBrain } from "./hooks/useBrain";
import { useChat } from "./hooks/useChat";
import { useNow } from "./hooks/useNow";
import { loadIdentity, saveIdentity } from "./lib/identity";
import { T } from "./theme";

const TOAST_MS = 4200;

export default function App() {
  const [identity, setIdentity] = useState<Identity>(loadIdentity);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const now = useNow(1000);
  const mountedAt = useRef(Date.now());

  const brain = useBrain(identity);
  const chat = useChat(identity);

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

  const handleEdit = useCallback(
    (slot: SlotId, value: string) => brain.edit(slot, value),
    [brain],
  );

  // El reloj de sesión cuenta desde lo más antiguo que conocemos de esta sala.
  const sessionSeconds = useMemo(() => {
    const oldest = Math.min(
      mountedAt.current,
      ...chat.entries.map((entry) => entry.at),
      ...brain.log.map((entry) => entry.at),
    );
    return (now - oldest) / 1000;
  }, [now, chat.entries, brain.log]);

  // Cada paciente llega a una sala limpia: el chat se pinta solo desde que empezó su
  // ronda, para que la conversación del anterior no contamine la suya.
  const visibleEntries = useMemo(
    () => chat.entries.filter((entry) => entry.at >= brain.roundStartedAt),
    [chat.entries, brain.roundStartedAt],
  );

  // El desenlace se retiene en local: el canal lo borra en cuanto arranca la ronda
  // siguiente, pero el marcador debe seguir en pantalla hasta que lo cierres tú.
  const [heldEnd, setHeldEnd] = useState<BrainRoundEnd | null>(null);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  useEffect(() => {
    const incoming = brain.roundEnd;
    if (!incoming) return;
    setHeldEnd((current) => (endKey(current) === endKey(incoming) ? current : incoming));
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

  const bpm = useMemo(() => bpmFromLog(brain.log, now), [brain.log, now]);
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
        online={online}
        sessionSeconds={sessionSeconds}
        expediente={brain.expediente}
      />

      {disconnected && <Flatline />}

      <div className="paciente-body" style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <ChatPane
          entries={visibleEntries}
          identity={identity}
          typingNicknames={chat.typingNicknames}
          patientThinking={chat.patientThinking}
          locked={relevo}
          onSend={async (body) => {
            const reason = await chat.send(body);
            if (reason) showToast(reason);
            return reason;
          }}
          onTyping={chat.notifyTyping}
          onRename={rename}
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
