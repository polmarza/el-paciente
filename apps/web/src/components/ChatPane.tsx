import { useLayoutEffect, useRef, useState } from "react";
import { MAX_CHAT_CHARS, type Identity } from "@el-paciente/shared";
import { FONT, T } from "../theme";
import type { ChatEntry } from "../hooks/useChat";
import { useAiReveal } from "../hooks/useAiReveal";

interface ChatPaneProps {
  entries: ChatEntry[];
  identity: Identity;
  typingNicknames: string[];
  patientThinking: boolean;
  onSend: (body: string) => Promise<string | null>;
  onTyping: () => void;
  onRename: (nickname: string) => void;
}

/** La voz del paciente: cálida, humana, en contraste con la mesa de operaciones. */
export function ChatPane({
  entries,
  identity,
  typingNicknames,
  patientThinking,
  onSend,
  onTyping,
  onRename,
}: ChatPaneProps) {
  const [draft, setDraft] = useState("");
  const [renaming, setRenaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { revealedId, revealedText } = useAiReveal(entries);

  // Seguimos el final de la conversación salvo que el espectador haya subido a leer.
  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    if (distanceFromBottom < 180) element.scrollTop = element.scrollHeight;
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
        width: "55%",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: T.chatBg,
        borderRight: `1px solid ${T.chatDivider}`,
      }}
    >
      <div
        ref={scrollRef}
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
          fontSize: 12,
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
          display: "flex",
          gap: 12,
          alignItems: "center",
          padding: "12px 34px 18px",
          borderTop: `1px solid ${T.chatComposerBorder}`,
        }}
      >
        {renaming ? (
          <input
            className="chat-input"
            defaultValue={identity.nickname}
            autoFocus
            maxLength={24}
            aria-label="Cambiar tu nombre en la sala"
            onBlur={(event) => {
              onRename(event.target.value);
              setRenaming(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              else if (event.key === "Escape") setRenaming(false);
            }}
            style={{
              width: 130,
              flex: "none",
              boxSizing: "border-box",
              background: T.chatInputBg,
              border: `1px solid rgba(155,232,155,.35)`,
              color: identity.color,
              fontFamily: FONT.mono,
              fontSize: 12,
              padding: "5px 10px",
              borderRadius: 2,
              outline: "none",
            }}
          />
        ) : (
          <button
            type="button"
            title="Haz clic para cambiar tu nombre"
            onClick={() => setRenaming(true)}
            style={{
              fontFamily: FONT.mono,
              fontSize: 12,
              color: identity.color,
              background: "transparent",
              border: `1px solid rgba(155,232,155,.35)`,
              padding: "5px 10px",
              borderRadius: 2,
              flex: "none",
              cursor: "pointer",
            }}
          >
            @{identity.nickname}
          </button>
        )}
        <input
          className="chat-input"
          value={draft}
          maxLength={MAX_CHAT_CHARS}
          onChange={(event) => {
            setDraft(event.target.value);
            onTyping();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") void submit();
          }}
          placeholder="Háblale al paciente…"
          aria-label="Mensaje para EL PACIENTE"
          style={{
            flex: 1,
            background: T.chatInputBg,
            border: `1px solid ${T.chatInputBorder}`,
            color: "#e9ded1",
            fontFamily: FONT.sans,
            fontSize: 16,
            padding: "11px 14px",
            borderRadius: 3,
            outline: "none",
          }}
        />
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
          fontSize: 12,
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
      <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 13.5,
            fontWeight: 600,
            color: message.color,
            flex: "none",
          }}
        >
          @{message.nickname}
        </span>
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: 16.5,
            lineHeight: 1.45,
            color: T.humanText,
          }}
        >
          {message.body}
        </span>
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
          fontSize: 11,
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
          fontSize: 19,
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
