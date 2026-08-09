import { useLayoutEffect, useRef, useState } from "react";
import { MAX_PASILLO_CHARS, type Identity } from "@el-paciente/shared";
import { FONT, T, SIZE } from "../theme";
import { keyClick } from "../lib/sound";
import type { PasilloEntry } from "../hooks/usePasillo";

/** Igual que en el chat: seguimos al fondo solo si el lector ya estaba abajo. */
const STICK_THRESHOLD_PX = 120;

interface PasilloPaneProps {
  entries: PasilloEntry[];
  identity: Identity;
  /** Cuánta gente hay dentro. Vive aquí porque el pasillo es la sala de los vivos. */
  online: number;
  /** Plegado a un riel vertical, para dejar la pantalla en dos columnas. */
  collapsed: boolean;
  /**
   * Si el plegado existe siquiera. En el shell móvil el pasillo es una pestaña y
   * plegarlo no significa nada: fuera el riel y fuera el botón ‹.
   */
  plegable: boolean;
  onToggle: () => void;
  onSend: (body: string) => Promise<string | null>;
}

/**
 * La tercera columna: el pasillo del quirófano. Aquí el público habla entre sí para
 * decidir qué le hacen al paciente, sin que él lo lea. Separarlo del chat evita que la
 * estrategia y las órdenes ("prueba a borrarle la regla") acaben en la conversación que
 * el paciente sí ve, que es la que tiene que leerse como una conversación de verdad.
 */
export function PasilloPane({
  entries,
  identity,
  online,
  collapsed,
  plegable,
  onToggle,
  onSend,
}: PasilloPaneProps) {
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

  // Plegado: un riel del ancho de un dedo que no se lleva sitio de la conversación,
  // pero sigue diciendo cuánta gente hay y cómo volver a abrirlo.
  if (plegable && collapsed) {
    return (
      <button
        type="button"
        className="paciente-pasillo"
        onClick={onToggle}
        title="Abrir el pasillo"
        aria-label="Abrir el pasillo"
        aria-expanded={false}
        style={{
          flex: "none",
          width: 42,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          padding: "14px 0",
          background: T.brainBg,
          border: "none",
          borderRight: `1px solid ${T.chatDivider}`,
          cursor: "pointer",
          fontFamily: FONT.mono,
        }}
      >
        <span style={{ fontSize: SIZE.small, color: T.textDim }}>›</span>
        <span
          style={{
            // De abajo arriba: se lee girando la cabeza a la izquierda, que es el lado
            // en el que está la columna.
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontSize: SIZE.micro,
            letterSpacing: ".16em",
            color: T.textDim,
          }}
        >
          EL PASILLO
        </span>
        <span style={{ fontSize: SIZE.micro, color: T.online }}>●</span>
        <span style={{ fontSize: SIZE.micro, color: T.online }}>{online}</span>
      </button>
    );
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
          fontSize: SIZE.micro,
          letterSpacing: ".16em",
          color: T.textDim,
          borderBottom: `1px solid ${T.brainRule}`,
        }}
      >
        <span>EL PASILLO</span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: T.online }}>● {online} DENTRO</span>
          {plegable && (
            <button
              type="button"
              onClick={onToggle}
              title="Plegar el pasillo"
              aria-label="Plegar el pasillo"
              aria-expanded
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                color: T.textDim,
                fontFamily: FONT.mono,
                fontSize: SIZE.small,
                cursor: "pointer",
              }}
            >
              ‹
            </button>
          )}
        </span>
      </div>

      <div
        style={{
          flex: "none",
          padding: "9px 18px 0",
          fontFamily: FONT.mono,
          fontSize: SIZE.micro,
          lineHeight: 1.5,
          color: T.textFaint,
        }}
      >
        El paciente no puede leer este chat
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
          <div style={{ fontFamily: FONT.mono, fontSize: SIZE.small, color: T.logPrev, lineHeight: 1.5 }}>
            Nadie ha dicho nada aún. Aquí podéis poneros de acuerdo antes de tocarle nada.
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} style={{ fontSize: SIZE.body, lineHeight: 1.45 }}>
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
            else if (event.key.length === 1 || event.key === "Backspace") keyClick();
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
            fontSize: SIZE.body,
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
            fontSize: SIZE.lead,
            cursor: draft.trim() ? "pointer" : "default",
          }}
        >
          ↵
        </button>
      </div>
    </div>
  );
}
