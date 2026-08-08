import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChannelStatus } from "@portalsdk/core";
import { bpmFromLog, type Identity, type SlotId } from "@el-paciente/shared";
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
      <Monitor bpm={bpm} online={online} sessionSeconds={sessionSeconds} />

      {disconnected && <Flatline />}

      <div className="paciente-body" style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <ChatPane
          entries={chat.entries}
          identity={identity}
          typingNicknames={chat.typingNicknames}
          patientThinking={chat.patientThinking}
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
          onEdit={handleEdit}
          onCursor={brain.announceCursor}
          onReject={showToast}
        />
      </div>

      {brain.roundEnd && brain.roundEnd.nextAt > now && (
        <RoundOverlay roundEnd={brain.roundEnd} now={now} />
      )}
      {toast && <Toast text={toast} />}
    </div>
  );
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
