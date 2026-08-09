import { useState } from "react";
import { FONT, T, SIZE } from "../theme";
import { MobileModal } from "./MobileModal";

interface BurgerMenuProps {
  nickname: string;
  nicknameColor: string;
  onRename: (nickname: string) => void;
  /** Pedir un paciente nuevo. Lo decide el agente, que puede negarse. */
  onNewGame: () => void;
  onShowHelp: () => void;
  silenced: boolean;
  onToggleSound: () => void;
  noHints: boolean;
  onToggleHints: () => void;
}

/** Qué diálogo hay abierto por encima del menú, si hay alguno. */
type Dialog = null | "nombre" | "partida";

/**
 * El menú de la cabecera móvil: lo que en escritorio son botones sueltos, aquí en
 * columna con dedales de verdad (≥46px).
 *
 * Las dos acciones que piden algo del usuario —cambiar de nombre y traer un paciente
 * nuevo— salen del menú y abren su propio diálogo. Dentro del desplegable eran
 * incómodas: el menú se cierra al tocar fuera (justo lo que haces al buscar el teclado),
 * y en un panel estrecho ni un campo de texto ni un "¿seguro?" tienen sitio.
 */
export function BurgerMenu({
  nickname,
  nicknameColor,
  onRename,
  onNewGame,
  onShowHelp,
  silenced,
  onToggleSound,
  noHints,
  onToggleHints,
}: BurgerMenuProps) {
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [draftName, setDraftName] = useState(nickname);

  function openDialog(which: Exclude<Dialog, null>) {
    setOpen(false);
    if (which === "nombre") setDraftName(nickname);
    setDialog(which);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Cerrar el menú" : "Abrir el menú"}
        aria-expanded={open}
        style={{
          flex: "none",
          width: 40,
          height: 40,
          background: "transparent",
          border: `1px solid ${T.monitorBorder}`,
          borderRadius: 2,
          color: open ? T.textBright : T.textDim,
          fontFamily: FONT.mono,
          fontSize: SIZE.body,
          cursor: "pointer",
          padding: 0,
        }}
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <>
          {/* Telón invisible: tocar fuera cierra el menú. */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 54, background: "rgba(4,6,8,.45)" }}
          />
          <div
            role="menu"
            style={{
              position: "fixed",
              top: 52,
              right: 8,
              zIndex: 55,
              width: 250,
              display: "flex",
              flexDirection: "column",
              background: T.monitorBg,
              border: `1px solid ${T.monitorBorder}`,
              borderRadius: 3,
              boxShadow: "0 10px 30px rgba(0,0,0,.55)",
              overflow: "hidden",
            }}
          >
            <MenuRow
              label={silenced ? "♪ Sonido: apagado" : "♪ Sonido: encendido"}
              tone={silenced ? T.textFaint : T.vital}
              onClick={onToggleSound}
            />
            <MenuRow
              label={noHints ? "✱ Pistas: apagadas" : "✱ Pistas: encendidas"}
              tone={noHints ? T.textFaint : T.vital}
              onClick={onToggleHints}
            />
            <MenuRow
              label="? Cómo se juega"
              tone={T.textMono}
              onClick={() => {
                setOpen(false);
                onShowHelp();
              }}
            />
            <MenuRow
              label={`@${nickname}`}
              hint="Cambiar tu nombre"
              tone={nicknameColor}
              onClick={() => openDialog("nombre")}
            />
            <MenuRow
              label="Nueva partida"
              hint="Se llevan a este paciente"
              tone={T.textMono}
              onClick={() => openDialog("partida")}
            />
          </div>
        </>
      )}

      {dialog === "nombre" && (
        <MobileModal
          title="TU NOMBRE EN LA SALA"
          confirmLabel="GUARDAR"
          confirmDisabled={!draftName.trim()}
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            onRename(draftName);
            setDialog(null);
          }}
        >
          <input
            className="chat-input"
            value={draftName}
            autoFocus
            maxLength={24}
            aria-label="Cambiar tu nombre en la sala"
            onChange={(event) => setDraftName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || !draftName.trim()) return;
              onRename(draftName);
              setDialog(null);
            }}
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: T.chatInputBg,
              border: `1px solid ${T.chatInputBorder}`,
              color: nicknameColor,
              fontFamily: FONT.mono,
              fontSize: SIZE.body,
              padding: "12px 14px",
              borderRadius: 2,
              outline: "none",
            }}
          />
          <p
            style={{
              margin: "10px 0 0",
              fontFamily: FONT.mono,
              fontSize: SIZE.micro,
              lineHeight: 1.6,
              color: T.textFaint,
            }}
          >
            Queda escrito en su historial cada vez que le tocas algo, y es como te
            reconoce el resto de la sala.
          </p>
        </MobileModal>
      )}

      {dialog === "partida" && (
        <MobileModal
          title="¿TRAER UN PACIENTE NUEVO?"
          confirmLabel="SÍ, TRAER OTRO"
          danger
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            onNewGame();
            setDialog(null);
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: FONT.mono,
              fontSize: SIZE.small,
              lineHeight: 1.65,
              color: T.textMono,
            }}
          >
            Se acaba la partida de todos los que están en la sala, y su secreto se va con
            él sin que nadie lo sepa.
          </p>
        </MobileModal>
      )}
    </>
  );
}

function MenuRow({
  label,
  hint,
  tone,
  onClick,
}: {
  label: string;
  hint?: string;
  tone: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        minHeight: 46,
        textAlign: "left",
        padding: hint ? "9px 14px" : "0 14px",
        background: "transparent",
        border: "none",
        borderBottom: `1px solid ${T.brainRule}`,
        color: tone,
        fontFamily: FONT.mono,
        fontSize: SIZE.small,
        letterSpacing: ".06em",
        cursor: "pointer",
      }}
    >
      {label}
      {hint && (
        <span style={{ display: "block", marginTop: 3, fontSize: SIZE.micro, color: T.textFaint }}>
          {hint}
        </span>
      )}
    </button>
  );
}
