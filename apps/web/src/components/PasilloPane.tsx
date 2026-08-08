import { useLayoutEffect, useRef, useState } from "react";
import { MAX_PASILLO_CHARS, type Identity } from "@el-paciente/shared";
import { FONT, T } from "../theme";
import type { PasilloEntry } from "../hooks/usePasillo";

/** Igual que en el chat: seguimos al fondo solo si el lector ya estaba abajo. */
const STICK_THRESHOLD_PX = 120;

interface PasilloPaneProps {
  entries: PasilloEntry[];
  identity: Identity;
  onSend: (body: string) => Promise<string | null>;
}

/**
 * La tercera columna: el pasillo del quirófano. Aquí el público habla entre sí para
 * decidir qué le hacen al paciente, sin que él lo lea. Separarlo del chat evita que la
 * estrategia y las órdenes ("prueba a borrarle la regla") acaben en la conversación que
 * el paciente sí ve, que es la que tiene que leerse como una conversación de verdad.
 */
export function PasilloPane({ entries, identity, onSend }: PasilloPaneProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  function onScroll(event: React.UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    const distance = element.scrollHeight - element.scrollTop - element.clientHeight;
    stickToBottom.current = distance <= STICK_THRESHOLD_PX;
  }

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (element && stickToBottom.current) element.scrollTop = element.scrollHeight;
  }, [entries]);

  async function submit() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    await onSend(body);
  }

  return (
    <div
      className="paciente-pasillo"
      style={{
        width: "20%",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: T.brainBg,
        borderRight: `1px solid ${T.chatDivider}`,
      }}
    >
      <div
        style={{
          flex: "none",
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          padding: "13px 18px 11px",
          fontFamily: FONT.mono,
          fontSize: 11,
          letterSpacing: ".16em",
          color: T.textDim,
          borderBottom: `1px solid ${T.brainRule}`,
        }}
      >
        <span>EL PASILLO</span>
        <span title="EL PACIENTE no lee este canal" style={{ color: T.textFaint }}>
          NO LO OYE
        </span>
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 18px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 11,
        }}
      >
        {entries.length === 0 ? (
          <div style={{ fontFamily: FONT.mono, fontSize: 12, color: T.logPrev, lineHeight: 1.5 }}>
            Nadie ha dicho nada aún. Aquí podéis poneros de acuerdo antes de tocarle nada.
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} style={{ fontSize: 13.5, lineHeight: 1.45 }}>
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontWeight: 600,
                  color: entry.message.color,
                  marginRight: 7,
                }}
              >
                @{entry.message.nickname}
              </span>
              <span style={{ fontFamily: FONT.mono, color: T.humanText }}>
                {entry.message.body}
              </span>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          flex: "none",
          margin: "10px 18px 16px",
          display: "flex",
          alignItems: "stretch",
          background: T.slotInputBg,
          border: `1px solid ${T.slotBorder}`,
          borderRadius: 3,
        }}
      >
        <input
          className="chat-input"
          value={draft}
          maxLength={MAX_PASILLO_CHARS}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void submit();
          }}
          placeholder="Hablad entre vosotros…"
          aria-label={`Mensaje al pasillo como ${identity.nickname}`}
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            color: "#dff0ee",
            fontFamily: FONT.mono,
            fontSize: 13,
            padding: "9px 12px",
            borderRadius: 3,
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={() => void submit()}
          disabled={!draft.trim()}
          title="Enviar"
          aria-label="Enviar al pasillo"
          style={{
            flex: "none",
            width: 34,
            background: "transparent",
            border: "none",
            borderLeft: `1px solid ${T.slotBorder}`,
            color: draft.trim() ? T.online : T.textFaint,
            fontFamily: FONT.mono,
            fontSize: 15,
            cursor: draft.trim() ? "pointer" : "default",
          }}
        >
          ↵
        </button>
      </div>
    </div>
  );
}
