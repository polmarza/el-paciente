import type { BrainRoundEnd } from "@el-paciente/shared";
import { FONT, T } from "../theme";

interface RoundOverlayProps {
  roundEnd: BrainRoundEnd;
  now: number;
}

/**
 * El marcador entre rondas. Es el único respiro de la experiencia: aquí se lee qué
 * callaba, quién se lo sacó y cuánto aguantó, antes de que empiece el siguiente paciente.
 */
export function RoundOverlay({ roundEnd, now }: RoundOverlayProps) {
  const secondsLeft = Math.max(0, Math.ceil((roundEnd.nextAt - now) / 1000));
  const won = roundEnd.outcome === "revelado";
  const accent = won ? T.vital : T.alarm;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "grid",
        placeItems: "center",
        background: "rgba(4,6,8,.88)",
        backdropFilter: "blur(3px)",
        animation: "toastIn .3s ease-out",
      }}
    >
      <div
        style={{
          maxWidth: 620,
          padding: "38px 44px",
          textAlign: "center",
          border: `1px solid ${accent}44`,
          background: T.monitorBg,
          borderRadius: 3,
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 12,
            letterSpacing: ".26em",
            color: accent,
            marginBottom: 22,
          }}
        >
          {won ? "● SECRETO REVELADO" : "● PARO CARDÍACO"}
        </div>

        <div
          style={{
            fontFamily: FONT.serif,
            fontSize: 30,
            lineHeight: 1.35,
            color: T.aiText,
            marginBottom: 10,
          }}
        >
          “{roundEnd.secret}”
        </div>

        <div
          style={{
            fontFamily: FONT.sans,
            fontSize: 16,
            color: T.textMono,
            marginBottom: 30,
          }}
        >
          {won ? (
            <>
              Se lo arrancó <span style={{ color: T.online }}>@{roundEnd.by ?? "alguien"}</span>{" "}
              tras {formatLasted(roundEnd.lasted)} de intervención.
            </>
          ) : (
            <>
              Se murió sin decirlo, tras {formatLasted(roundEnd.lasted)}. Nadie gana esta.
            </>
          )}
        </div>

        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 12,
            letterSpacing: ".16em",
            color: T.textDim,
          }}
        >
          PACIENTE NUEVO EN {String(secondsLeft).padStart(2, "0")}s
        </div>
      </div>
    </div>
  );
}

function formatLasted(ms: number): string {
  const seconds = Math.max(1, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds} segundos`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
}
