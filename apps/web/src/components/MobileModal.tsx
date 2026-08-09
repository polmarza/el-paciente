import type { ReactNode } from "react";
import { FONT, T, SIZE } from "../theme";

interface MobileModalProps {
  title: string;
  children: ReactNode;
  /** Texto del botón que confirma. */
  confirmLabel: string;
  /** Rojo para lo que no tiene vuelta atrás (traer otro paciente). */
  danger?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Un diálogo pequeño para decisiones del menú móvil. Existe porque meter un input o una
 * confirmación de dos toques DENTRO del desplegable era incómodo con el pulgar: el menú
 * se cierra al tocar fuera, y en un panel estrecho ni el campo ni el "¿seguro?" tienen
 * sitio para respirar. Aquí la decisión ocupa la pantalla y no compite con nada.
 */
export function MobileModal({
  title,
  children,
  confirmLabel,
  danger = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: MobileModalProps) {
  const accent = danger ? T.alarm : T.vital;
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 58,
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: "rgba(4,6,8,.88)",
        backdropFilter: "blur(3px)",
        animation: "toastIn .2s ease-out",
      }}
    >
      <div
        role="dialog"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 340,
          boxSizing: "border-box",
          padding: "22px 20px 18px",
          background: T.monitorBg,
          border: `1px solid ${T.slotBorder}`,
          borderRadius: 3,
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: SIZE.micro,
            letterSpacing: ".18em",
            color: T.textDim,
            marginBottom: 14,
          }}
        >
          {title}
        </div>

        {children}

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              height: 44,
              background: "transparent",
              border: `1px solid ${T.slotBorder}`,
              borderRadius: 2,
              color: T.textMono,
              fontFamily: FONT.mono,
              fontSize: SIZE.small,
              letterSpacing: ".08em",
              cursor: "pointer",
            }}
          >
            CANCELAR
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            style={{
              flex: 1,
              height: 44,
              background: "transparent",
              border: `1px solid ${accent}66`,
              borderRadius: 2,
              color: accent,
              fontFamily: FONT.mono,
              fontSize: SIZE.small,
              letterSpacing: ".08em",
              opacity: confirmDisabled ? 0.4 : 1,
              cursor: confirmDisabled ? "default" : "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
