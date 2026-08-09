import { useState } from "react";
import { FONT, T, SIZE } from "../theme";

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

/**
 * El menú de la cabecera móvil: lo que en escritorio son botones sueltos, aquí en
 * columna con dedales de verdad (≥44px). La confirmación de NUEVA PARTIDA vive dentro
 * del propio menú: mismo patrón de dos toques que en escritorio.
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
  const [confirmNew, setConfirmNew] = useState(false);

  function close() {
    setOpen(false);
    setConfirmNew(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
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
            onClick={close}
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderBottom: `1px solid ${T.brainRule}`,
              }}
            >
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: SIZE.micro,
                  letterSpacing: ".12em",
                  color: T.textDim,
                }}
              >
                TU NOMBRE
              </span>
              <input
                className="chat-input"
                defaultValue={nickname}
                maxLength={24}
                aria-label="Cambiar tu nombre en la sala"
                onBlur={(event) => onRename(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                }}
                style={{
                  flex: 1,
                  minWidth: 0,
                  boxSizing: "border-box",
                  background: T.chatInputBg,
                  border: `1px solid ${T.chatInputBorder}`,
                  color: nicknameColor,
                  fontFamily: FONT.mono,
                  fontSize: SIZE.body,
                  padding: "8px 10px",
                  borderRadius: 2,
                  outline: "none",
                }}
              />
            </div>

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
                close();
                onShowHelp();
              }}
            />
            <MenuRow
              label={confirmNew ? "¿SEGURO? Se lo llevan" : "Nueva partida"}
              tone={confirmNew ? T.alarm : T.textMono}
              onClick={() => {
                if (confirmNew) {
                  onNewGame();
                  close();
                } else {
                  setConfirmNew(true);
                  setTimeout(() => setConfirmNew(false), 4000);
                }
              }}
            />
          </div>
        </>
      )}
    </>
  );
}

function MenuRow({ label, tone, onClick }: { label: string; tone: string; onClick: () => void }) {
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
        padding: "0 14px",
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
    </button>
  );
}
