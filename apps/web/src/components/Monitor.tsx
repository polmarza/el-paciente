import { useEffect, useRef, useState } from "react";
import { BPM_ALARM, BPM_RESTING } from "@el-paciente/shared";
import { FONT, T } from "../theme";
import { isMuted, monitorPing, setMuted } from "../lib/sound";
import { hintsDisabled, setHintsDisabled } from "../lib/hints";

interface MonitorProps {
  bpm: number;
  online: number;
  sessionSeconds: number;
  /** Cambia con cada ronda: cada paciente tiene su propio expediente. */
  expediente: string;
  onShowHelp: () => void;
}

/** Duración del ciclo del electro en reposo, tal como venía en el diseño. */
const ECG_CYCLE_MS = 2200;
/**
 * En qué punto del ciclo cae el pico visible. Es lo único de aquí que se afina a ojo:
 * si el bip suena adelantado respecto al pico, sube este número.
 */
const PEAK_AT = 0.3;

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
  const ecgRef = useRef<SVGPolylineElement>(null);

  // El electro y el latido comparten fase: el bip cae siempre sobre el pico.
  //
  // El latido se reprograma a sí mismo leyendo el periodo actual de una referencia, en
  // vez de reiniciar un intervalo cada vez que cambia el pulso. Con intervalos, cada
  // cambio de LPM cortaba el latido a media zancada y se oía un tartamudeo — justo en
  // los momentos de tensión, que es cuando más se nota. Así acelera de forma continua.
  const period = (ECG_CYCLE_MS * BPM_RESTING) / Math.max(BPM_RESTING, bpm);
  const alarming = bpm > BPM_ALARM;

  const periodRef = useRef(period);
  periodRef.current = period;
  const alarmingRef = useRef(alarming);
  alarmingRef.current = alarming;

  useEffect(() => {
    const line = ecgRef.current;
    if (!line) return;

    const animation = line.animate(
      [{ strokeDashoffset: "0" }, { strokeDashoffset: "-300" }],
      { duration: ECG_CYCLE_MS, iterations: Infinity, easing: "linear" },
    );

    let timer: ReturnType<typeof setTimeout>;
    const beat = () => {
      monitorPing(alarmingRef.current);
      // Realineamos el electro con el bip que acaba de sonar. La corrección por ciclo es
      // mínima, así que no se ve saltar.
      animation.currentTime = ECG_CYCLE_MS * PEAK_AT;
      timer = setTimeout(beat, periodRef.current);
    };
    timer = setTimeout(beat, period * PEAK_AT);

    return () => {
      animation.cancel();
      clearTimeout(timer);
    };
    // Se monta una sola vez: el ritmo lo lleva la referencia, no las dependencias.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // El electro acelera cambiando su velocidad, no su duración: así conserva la fase.
  useEffect(() => {
    const line = ecgRef.current;
    const animation = line?.getAnimations()[0];
    animation?.updatePlaybackRate(ECG_CYCLE_MS / period);
  }, [period]);

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
            ref={ecgRef}
            points="0,13 22,13 28,13 33,4 38,22 43,13 62,13 68,9 72,13 110,13"
            fill="none"
            stroke={bpmColor}
            strokeWidth="1.6"
            strokeDasharray="150 150"
          />
        </svg>
        <span style={{ color: bpmColor, fontWeight: 600, fontSize: 15 }}>{bpm}</span>
        <span style={{ color: T.textDim }}>LPM</span>
      </div>

      <div style={{ flex: 1 }} />
      <span style={{ color: T.textDim }} title="Tiempo que lleva vivo este paciente">
        EN QUIRÓFANO {formatClock(sessionSeconds)}
      </span>
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
