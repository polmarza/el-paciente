import { useLayoutEffect, useRef, useState } from "react";
import { MAX_CHAT_CHARS } from "@el-paciente/shared";
import { FONT, T, SIZE } from "../theme";
import { keyClick } from "../lib/sound";
import type { ChatEntry } from "../hooks/useChat";
import { useAiReveal } from "../hooks/useAiReveal";

/**
 * Margen para considerar que sigues "abajo". Generoso a propósito: con el tecleo en vivo
 * el contenido crece bajo tus pies, y un umbral corto te soltaría del fondo sin querer.
 */
const STICK_THRESHOLD_PX = 120;

interface ChatPaneProps {
  entries: ChatEntry[];
  typingNicknames: string[];
  patientThinking: boolean;
  /** Durante el relevo entre pacientes no hay nadie a quien hablarle. */
  locked: boolean;
  onSend: (body: string) => Promise<string | null>;
  onTyping: () => void;
}

/** La voz del paciente: cálida, humana, en contraste con la mesa de operaciones. */
export function ChatPane({
  entries,
  typingNicknames,
  patientThinking,
  locked,
  onSend,
  onTyping,
}: ChatPaneProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { revealedId, revealedText } = useAiReveal(entries);

  // Seguimos el final de la conversación, pero solo mientras el espectador esté abajo.
  // La decisión se toma al hacer scroll, no al llegar contenido: si se midiera después de
  // insertar el mensaje, uno largo despegaría el seguimiento él solo.
  const stickToBottom = useRef(true);

  function onScroll(event: React.UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    stickToBottom.current = distanceFromBottom <= STICK_THRESHOLD_PX;
  }

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (element && stickToBottom.current) element.scrollTop = element.scrollHeight;
  }, [entries, revealedText]);

  // useChat ya descarta nuestra propia sesión al resolver los nicknames.
  const othersTyping = typingNicknames;

  async function submit() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    await onSend(body);
  }

  return (
    <div
      className="paciente-chat"
      style={{
        width: "45%",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: T.chatBg,
        borderRight: `1px solid ${T.chatDivider}`,
      }}
    >
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 34px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {entries.map((entry) => (
          <Message
            key={entry.id}
            entry={entry}
            revealing={entry.id === revealedId}
            revealedText={revealedText}
          />
        ))}
      </div>

      <div
        style={{
          height: 26,
          flex: "none",
          padding: "0 34px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontFamily: FONT.mono,
          fontSize: SIZE.small,
        }}
      >
        {patientThinking && (
          <span style={{ color: T.typing, animation: "pulseDot 1.1s ease-in-out infinite" }}>
            EL PACIENTE está pensando…
          </span>
        )}
        {othersTyping.length > 0 && (
          <span style={{ color: T.textMono, animation: "pulseDot 1.1s ease-in-out infinite" }}>
            {othersTyping.length === 1
              ? `@${othersTyping[0]} está escribiendo…`
              : `${othersTyping.length} personas están escribiendo…`}
          </span>
        )}
      </div>

      <div
        style={{
          flex: "none",
          margin: "10px 34px 16px",
          display: "flex",
          alignItems: "stretch",
          background: T.chatInputBg,
          border: `1px solid ${T.chatInputBorder}`,
          borderRadius: 3,
          opacity: locked ? 0.45 : 1,
        }}
      >
        <input
          className="chat-input"
          value={draft}
          disabled={locked}
          maxLength={MAX_CHAT_CHARS}
          onChange={(event) => {
            setDraft(event.target.value);
            onTyping();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") void submit();
            else if (event.key.length === 1 || event.key === "Backspace") keyClick();
          }}
          placeholder={locked ? "Preparando al siguiente paciente…" : "Háblale al paciente…"}
          aria-label="Mensaje para EL PACIENTE"
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            color: "#e9ded1",
            fontFamily: FONT.mono,
            fontSize: SIZE.body,
            padding: "9px 12px",
            borderRadius: 3,
            outline: "none",
            cursor: locked ? "not-allowed" : "auto",
          }}
        />
        <button
          type="button"
          onClick={() => void submit()}
          disabled={locked || !draft.trim()}
          title="Enviar"
          aria-label="Enviar al paciente"
          style={{
            flex: "none",
            width: 34,
            background: "transparent",
            border: "none",
            borderLeft: `1px solid ${T.chatInputBorder}`,
            color: draft.trim() && !locked ? T.online : T.textFaint,
            fontFamily: FONT.mono,
            fontSize: SIZE.lead,
            cursor: draft.trim() && !locked ? "pointer" : "default",
          }}
        >
          ↵
        </button>
      </div>
    </div>
  );
}

function Message({
  entry,
  revealing,
  revealedText,
}: {
  entry: ChatEntry;
  revealing: boolean;
  revealedText: string;
}) {
  const { message } = entry;

  if (message.role === "system") {
    return (
      <div
        style={{
          alignSelf: "center",
          fontFamily: FONT.mono,
          fontSize: SIZE.small,
          letterSpacing: ".07em",
          color: T.amberSoft,
          padding: "5px 16px",
          border: `1px solid rgba(199,154,78,.28)`,
          background: "rgba(199,154,78,.06)",
          borderRadius: 2,
        }}
      >
        ▲ {message.body}
      </div>
    );
  }

  if (message.role === "human") {
    return (
      <div
        style={{
          alignSelf: "flex-end",
          maxWidth: "78%",
          background: T.slotInputBg,
          border: `1px solid ${T.chatInputBorder}`,
          borderRadius: 3,
          padding: "9px 14px 10px",
          textAlign: "right",
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: SIZE.micro,
            fontWeight: 600,
            color: message.color,
            marginBottom: 4,
          }}
        >
          @{message.nickname}
        </div>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: SIZE.body,
            lineHeight: 1.5,
            color: T.humanText,
            textAlign: "left",
          }}
        >
          {message.body}
        </div>
      </div>
    );
  }

  const crisis = message.crisis;
  return (
    <div
      style={{
        background: "rgba(240,226,208,.045)",
        padding: "14px 20px 16px",
        borderRadius: 3,
        maxWidth: "92%",
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: SIZE.micro,
          letterSpacing: ".2em",
          color: crisis ? T.aiNameCrisis : T.aiName,
          marginBottom: 8,
        }}
      >
        {crisis ? "EL PACIENTE — EPISODIO" : "EL PACIENTE"}
      </div>
      <div
        style={{
          fontFamily: FONT.serif,
          fontSize: SIZE.voice,
          lineHeight: 1.55,
          color: crisis ? T.aiTextCrisis : T.aiText,
        }}
      >
        {revealing ? revealedText : message.body}
        {revealing && (
          <span
            style={{
              display: "inline-block",
              width: 9,
              height: 18,
              background: T.caret,
              marginLeft: 4,
              verticalAlign: -2,
              animation: "blink 1s steps(1) infinite",
            }}
          />
        )}
      </div>
    </div>
  );
}
