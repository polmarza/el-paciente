import { useEffect, useMemo, useRef, useState } from "react";
import { BPM_ALARM, BPM_RESTING } from "@el-paciente/shared";
import { FONT, T } from "../theme";
import { isMuted, monitorPing, setMuted } from "../lib/sound";
import { hintsDisabled, setHintsDisabled } from "../lib/hints";

/** Ancho visible del electro, en unidades del viewBox. */
const ECG_WIDTH = 110;
const ECG_HEIGHT = 26;
/** Separación entre latidos en reposo. Al subir el pulso se acorta: caben más picos. */
const BEAT_WIDTH_AT_REST = 44;
/** Duración del ciclo en reposo. Es lo que tarda la onda en avanzar un latido. */
const ECG_CYCLE_MS = 2200;
/** Dónde cae el pico R dentro del latido, y dónde está la referencia en pantalla. */
const R_AT = 0.36;
const REFERENCE_X = ECG_WIDTH / 2;

/**
 * Un latido, en fracciones del ancho de latido y en unidades del viewBox para la altura.
 * El pico R cae exactamente en R_AT, y la traza avanza justo un latido por ciclo: en cada
 * arranque de ciclo hay un pico R sobre la referencia. Por eso el bip está sincronizado
 * por construcción y no hay ninguna constante que ajustar a ojo.
 */
const BEAT_SHAPE: [number, number][] = [
  [0.0, 13],
  [0.2, 13],
  [0.25, 10.5],
  [0.3, 13],
  [R_AT - 0.03, 13],
  [R_AT, 3],
  [R_AT + 0.04, 21],
  [R_AT + 0.08, 13],
  [0.62, 9.5],
  [0.7, 13],
  [1.0, 13],
];

/** Construye la traza completa, con latidos de sobra a los lados para poder scrollar. */
function buildTrace(beatWidth: number): string {
  const first = REFERENCE_X - R_AT * beatWidth;
  const before = Math.ceil(first / beatWidth) + 1;
  const after = Math.ceil((ECG_WIDTH - first) / beatWidth) + 2;

  const points: string[] = [];
  for (let k = -before; k < after; k++) {
    const origin = first + k * beatWidth;
    for (const [fraction, y] of BEAT_SHAPE) {
      points.push(`${(origin + fraction * beatWidth).toFixed(2)},${y}`);
    }
  }
  return points.join(" ");
}

interface MonitorProps {
  bpm: number;
  online: number;
  sessionSeconds: number;
  /** Cambia con cada ronda: cada paciente tiene su propio expediente. */
  expediente: string;
  onShowHelp: () => void;
}

/** La cabecera del monitor: identidad del paciente, pulso, reloj y aforo. */
export function Monitor({ bpm, online, sessionSeconds, expediente, onShowHelp }: MonitorProps) {
  const bpmColor = bpm > BPM_ALARM ? T.alarm : T.vital;
  const [silenced, setSilenced] = useState(isMuted);
  const [noHints, setNoHints] = useState(hintsDisabled);
  const traceRef = useRef<SVGGElement>(null);

  // Cuanto más alto el pulso, más juntos los latidos y más rápido avanza la traza: la
  // onda no solo va más deprisa, también se ve más apretada. Es lo que hace un monitor
  // de verdad, y se lee de un vistazo desde el fondo de la sala.
  const rate = Math.max(BPM_RESTING, bpm) / BPM_RESTING;
  const beatWidth = BEAT_WIDTH_AT_REST / rate;
  const period = ECG_CYCLE_MS / rate;
  const alarming = bpm > BPM_ALARM;

  const trace = useMemo(() => buildTrace(beatWidth), [beatWidth]);

  const periodRef = useRef(period);
  periodRef.current = period;
  const alarmingRef = useRef(alarming);
  alarmingRef.current = alarming;
  const beatWidthRef = useRef(beatWidth);
  beatWidthRef.current = beatWidth;

  // El latido se reprograma a sí mismo leyendo el ritmo actual de una referencia. Con un
  // intervalo fijo, cada cambio de LPM lo cortaba a media zancada y se oía un tartamudeo
  // justo en los momentos de tensión.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const beat = () => {
      monitorPing(alarmingRef.current);
      // La traza vuelve al arranque del ciclo, así que el pico R que acaba de sonar está
      // exactamente sobre la referencia.
      const group = traceRef.current;
      if (group) {
        group.getAnimations().forEach((animation) => animation.cancel());
        group.animate(
          [
            { transform: "translateX(0px)" },
            { transform: `translateX(${-beatWidthRef.current}px)` },
          ],
          { duration: periodRef.current, easing: "linear", fill: "forwards" },
        );
      }
      timer = setTimeout(beat, periodRef.current);
    };

    beat();
    return () => clearTimeout(timer);
    // Se monta una sola vez: el ritmo lo llevan las referencias, no las dependencias.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <svg
          width={ECG_WIDTH}
          height={ECG_HEIGHT}
          viewBox={`0 0 ${ECG_WIDTH} ${ECG_HEIGHT}`}
          style={{ overflow: "hidden" }}
          aria-hidden="true"
        >
          <g ref={traceRef}>
            <polyline points={trace} fill="none" stroke={bpmColor} strokeWidth="1.6" />
          </g>
        </svg>
        <span style={{ color: bpmColor, fontWeight: 600, fontSize: 15 }}>{bpm}</span>
        <span style={{ color: T.textDim }}>LPM</span>
      </div>

      <div style={{ flex: 1 }} />
      <span style={{ color: T.textDim }} title="Tiempo que lleva vivo este paciente">
        EN QUIRÓFANO {formatClock(sessionSeconds)}
      </span>
      <span style={{ color: T.online }}>● {online} DENTRO</span>
      <ToggleButton
        active={!silenced}
        label="♪"
        title={silenced ? "Activar el sonido" : "Silenciar el monitor"}
        onClick={toggleSound}
      />
      <ToggleButton
        active={!noHints}
        label="✱"
        title={noHints ? "Activar las pistas" : "Desactivar las pistas"}
        onClick={toggleHints}
      />
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

/** Encendido en verde, apagado en gris y tachado: se lee sin acercarse a la pantalla. */
function ToggleButton({
  active,
  label,
  title,
  onClick,
}: {
  active: boolean;
  label: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={!active}
      style={{
        fontFamily: FONT.mono,
        fontSize: 11,
        color: active ? T.vital : T.textFaint,
        background: active ? `${T.vital}1c` : "transparent",
        border: `1px solid ${active ? `${T.vital}66` : T.monitorBorder}`,
        borderRadius: 2,
        height: 22,
        padding: "0 7px",
        cursor: "pointer",
        textDecoration: active ? "none" : "line-through",
      }}
    >
      {label}
    </button>
  );
}

function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((part) => String(part).padStart(2, "0")).join(":");
}
