import { FONT, T, SIZE } from "../theme";

/**
 * Aviso efímero: el motivo de un rechazo del quirófano, o una pista. Anclado abajo a la
 * derecha — centrado y flotante se camuflaba con el composer y nadie lo veía.
 */
export function Toast({ text }: { text: string }) {
  const isHint = text.startsWith("PISTA");
  return (
    <div
      role="status"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        maxWidth: 340,
        zIndex: 40,
        fontFamily: FONT.mono,
        fontSize: SIZE.small,
        lineHeight: 1.5,
        letterSpacing: ".04em",
        color: T.amber,
        background: "rgba(20,14,8,.97)",
        borderLeft: `3px solid ${T.amber}`,
        border: `1px solid rgba(224,164,60,.4)`,
        borderLeftWidth: 3,
        borderRadius: 2,
        padding: "11px 16px",
        boxShadow: "0 6px 24px rgba(0,0,0,.5)",
        animation: "toastInRight .22s ease-out",
      }}
    >
      {isHint ? "✱" : "▲"} {text}
    </div>
  );
}
