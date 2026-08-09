import { FONT, T, SIZE } from "../theme";
import { useIsMobile } from "../hooks/useIsMobile";

/**
 * Aviso efímero: el motivo de un rechazo del quirófano, o una pista. Anclado arriba a la
 * derecha, bajo la cabecera — abajo a la derecha tapaba el parte de ingreso y el tirador
 * del historial, que es justo donde miras después de leer una pista.
 *
 * El rechazo y la pista comparten forma pero no color: un cooldown es un "no" y usaba el
 * mismo ámbar que la pista amistosa, así que costaba distinguir un error de una sugerencia
 * de un vistazo. El rechazo va en rojo de alarma; la pista se queda en ámbar.
 */
export function Toast({ text }: { text: string }) {
  const mobile = useIsMobile();
  const isHint = text.startsWith("PISTA");
  const accent = isHint ? T.amber : T.alarm;
  const softBorder = isHint ? "rgba(224,164,60,.4)" : "rgba(224,92,92,.4)";
  return (
    <div
      role="status"
      style={{
        position: "fixed",
        // Bajo la cabecera: 47px la completa, 48px la compacta, más aire.
        top: mobile ? 58 : 63,
        right: mobile ? 12 : 24,
        left: mobile ? 12 : undefined,
        maxWidth: mobile ? undefined : 340,
        zIndex: 40,
        fontFamily: FONT.mono,
        fontSize: SIZE.small,
        lineHeight: 1.5,
        letterSpacing: ".04em",
        color: accent,
        background: "rgba(20,14,8,.97)",
        // Todo en propiedades sueltas: mezclar taquigrafía (border) con una suelta
        // (borderLeft) hace que React avise de posibles bugs de estilo, y con razón.
        borderStyle: "solid",
        borderWidth: "1px 1px 1px 3px",
        borderTopColor: softBorder,
        borderRightColor: softBorder,
        borderBottomColor: softBorder,
        borderLeftColor: accent,
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
