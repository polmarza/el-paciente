import { useState } from "react";
import type { BrainRoundEnd } from "@el-paciente/shared";
import { FONT, T, SIZE } from "../theme";
import { downloadBlob, drawDiploma, formatLasted } from "../lib/diploma";

interface RoundOverlayProps {
  roundEnd: BrainRoundEnd;
  now: number;
  onClose: () => void;
}

/**
 * El marcador del desenlace. No se cierra solo: es el único respiro de la experiencia y
 * lo que la gente quiere leer con calma y compartir. La ronda siguiente arranca por
 * debajo mientras tanto.
 */
export function RoundOverlay({ roundEnd, now, onClose }: RoundOverlayProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const secondsLeft = Math.max(0, Math.ceil((roundEnd.nextAt - now) / 1000));
  const won = roundEnd.outcome === "revelado";
  const withdrawn = roundEnd.outcome === "retirado";
  const accent = won ? T.vital : withdrawn ? T.textMono : T.alarm;
  const heading = won
    ? "● SECRETO REVELADO"
    : withdrawn
      ? "● PACIENTE RETIRADO"
      : "● PARO CARDÍACO";

  async function download() {
    setSaving(true);
    setError(null);
    try {
      const blob = await drawDiploma(roundEnd);
      downloadBlob(blob, `el-paciente-${roundEnd.expediente}.png`);
    } catch {
      setError("No se pudo generar la imagen en este navegador.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
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
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label={won ? "Secreto revelado" : withdrawn ? "Paciente retirado" : "Paro cardíaco"}
        onClick={(event) => event.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: 620,
          padding: "38px 44px 34px",
          textAlign: "center",
          border: `1px solid ${accent}44`,
          background: T.monitorBg,
          borderRadius: 3,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            background: "transparent",
            border: "none",
            color: T.textDim,
            fontFamily: FONT.mono,
            fontSize: SIZE.lead,
            cursor: "pointer",
            lineHeight: 1,
            padding: 6,
          }}
        >
          ×
        </button>

        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: SIZE.small,
            letterSpacing: ".26em",
            color: accent,
            marginBottom: 8,
          }}
        >
          {heading}
        </div>

        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: SIZE.micro,
            letterSpacing: ".18em",
            color: T.textFaint,
            marginBottom: 22,
          }}
        >
          EXPEDIENTE Nº {roundEnd.expediente}
        </div>

        {roundEnd.secret && (
          <div
            style={{
              fontFamily: FONT.serif,
              fontSize: SIZE.title,
              lineHeight: 1.35,
              color: T.aiText,
              marginBottom: 10,
            }}
          >
            “{roundEnd.secret}”
          </div>
        )}

        <div
          style={{ fontFamily: FONT.mono, fontSize: SIZE.body, color: T.textMono, marginBottom: 26 }}
        >
          {won ? (
            <>
              Se lo arrancó <span style={{ color: T.online }}>@{roundEnd.by ?? "alguien"}</span>{" "}
              tras {formatLasted(roundEnd.lasted)} de intervención.
            </>
          ) : withdrawn ? (
            <>
              <span style={{ color: T.online }}>@{roundEnd.by ?? "alguien"}</span> pidió un
              paciente nuevo tras {formatLasted(roundEnd.lasted)}. Se lo llevó sin contarlo.
            </>
          ) : (
            <>Se murió sin decirlo, tras {formatLasted(roundEnd.lasted)}. Nadie gana esta.</>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => void download()}
            disabled={saving}
            style={{
              fontFamily: FONT.mono,
              fontSize: SIZE.small,
              letterSpacing: ".08em",
              color: accent,
              background: "transparent",
              border: `1px solid ${accent}66`,
              borderRadius: 2,
              padding: "9px 18px",
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "GENERANDO…" : "DESCARGAR PARTE"}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              fontFamily: FONT.mono,
              fontSize: SIZE.small,
              letterSpacing: ".08em",
              color: T.textMono,
              background: "transparent",
              border: `1px solid ${T.slotBorder}`,
              borderRadius: 2,
              padding: "9px 18px",
              cursor: "pointer",
            }}
          >
            VOLVER AL QUIRÓFANO
          </button>
        </div>

        {error && (
          <div style={{ fontFamily: FONT.mono, fontSize: SIZE.micro, color: T.alarm, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: SIZE.micro,
            letterSpacing: ".16em",
            color: T.textDim,
          }}
        >
          {secondsLeft > 0
            ? `PACIENTE NUEVO EN ${String(secondsLeft).padStart(2, "0")}s`
            : "YA HAY UN PACIENTE NUEVO EN LA SALA"}
        </div>
      </div>
    </div>
  );
}
