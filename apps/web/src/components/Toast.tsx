import { FONT, T } from "../theme";

/** Aviso efímero: casi siempre el motivo por el que el quirófano rechazó una edición. */
export function Toast({ text }: { text: string }) {
  return (
    <div
      role="status"
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 40,
        fontFamily: FONT.mono,
        fontSize: 12.5,
        letterSpacing: ".04em",
        color: T.amber,
        background: "rgba(20,14,8,.96)",
        border: `1px solid rgba(224,164,60,.4)`,
        borderRadius: 2,
        padding: "9px 16px",
        animation: "toastIn .18s ease-out",
      }}
    >
      ▲ {text}
    </div>
  );
}
