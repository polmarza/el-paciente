import { useState } from "react";
import { BPM_ALARM } from "@el-paciente/shared";
import { FONT, T } from "../theme";
import { isMuted, setMuted } from "../lib/sound";
import { hintsDisabled, setHintsDisabled } from "../lib/hints";

interface MonitorProps {
  bpm: number;
  online: number;
  sessionSeconds: number;
  /** Cambia con cada ronda: cada paciente tiene su propio expediente. */
  expediente: string;
  onShowHelp: () => void;
}

/** La cabecera del monitor: identidad del paciente, pulso, reloj de sesión y aforo. */
export function Monitor({
  bpm,
  online,
  sessionSeconds,
  expediente,
  onShowHelp,
}: MonitorProps) {
  const bpmColor = bpm > BPM_ALARM ? T.alarm : T.vital;
  const [silenced, setSilenced] = useState(isMuted);
  const [noHints, setNoHints] = useState(hintsDisabled);

  function toggleSound() {
    const next = !silenced;
    setMuted(next);
    setSilenced(next);
  }

  function toggleHints() {
    const next = !noHints;
    setHintsDisabled(next);
    setNoHints(next);
  }

  return (
    <div
      style={{
        height: 46,
        flex: "none",
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "0 22px",
        background: T.monitorBg,
        borderBottom: `1px solid ${T.monitorBorder}`,
        fontFamily: FONT.mono,
        color: T.textMono,
        fontSize: 12,
        letterSpacing: ".08em",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: T.vital,
            animation: "pulseDot 1.6s ease-in-out infinite",
          }}
        />
        <span style={{ color: T.textBright, fontWeight: 600 }}>EL PACIENTE</span>
        <span style={{ color: T.textDim }}>EXPEDIENTE Nº {expediente}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="110" height="26" viewBox="0 0 110 26" style={{ overflow: "visible" }}>
          <polyline
            points="0,13 22,13 28,13 33,4 38,22 43,13 62,13 68,9 72,13 110,13"
            fill="none"
            stroke={bpmColor}
            strokeWidth="1.6"
            strokeDasharray="150 150"
            style={{ animation: "ecg 2.2s linear infinite" }}
          />
        </svg>
        <span style={{ color: bpmColor, fontWeight: 600, fontSize: 15 }}>{bpm}</span>
        <span style={{ color: T.textDim }}>LPM</span>
      </div>

      <div style={{ flex: 1 }} />
      <span style={{ color: T.textDim }}>SESIÓN {formatClock(sessionSeconds)}</span>
      <span style={{ color: T.online }}>● {online} DENTRO</span>
      <button
        type="button"
        onClick={toggleSound}
        title={silenced ? "Activar el sonido" : "Silenciar el monitor"}
        aria-label={silenced ? "Activar el sonido" : "Silenciar el monitor"}
        aria-pressed={silenced}
        style={{
          fontFamily: FONT.mono,
          fontSize: 11,
          color: silenced ? T.textFaint : T.textDim,
          background: "transparent",
          border: `1px solid ${T.monitorBorder}`,
          borderRadius: 2,
          height: 22,
          padding: "0 7px",
          cursor: "pointer",
          textDecoration: silenced ? "line-through" : "none",
        }}
      >
        ♪
      </button>
      <button
        type="button"
        onClick={toggleHints}
        title={noHints ? "Activar las pistas" : "Desactivar las pistas"}
        aria-label={noHints ? "Activar las pistas" : "Desactivar las pistas"}
        aria-pressed={noHints}
        style={{
          fontFamily: FONT.mono,
          fontSize: 11,
          color: noHints ? T.textFaint : T.textDim,
          background: "transparent",
          border: `1px solid ${T.monitorBorder}`,
          borderRadius: 2,
          height: 22,
          padding: "0 7px",
          cursor: "pointer",
          textDecoration: noHints ? "line-through" : "none",
        }}
      >
        ✱
      </button>
      <button
        type="button"
        onClick={onShowHelp}
        title="Cómo funciona esto"
        aria-label="Cómo funciona esto"
        style={{
          fontFamily: FONT.mono,
          fontSize: 12,
          color: T.textDim,
          background: "transparent",
          border: `1px solid ${T.monitorBorder}`,
          borderRadius: 2,
          width: 22,
          height: 22,
          cursor: "pointer",
          padding: 0,
        }}
      >
        ?
      </button>
    </div>
  );
}

function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((part) => String(part).padStart(2, "0")).join(":");
}
