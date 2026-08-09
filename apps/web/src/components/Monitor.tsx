import { useEffect, useMemo, useRef, useState } from "react";
import { BPM_ALARM, BPM_RESTING } from "@el-paciente/shared";
import { FONT, T, SIZE } from "../theme";
import { isMuted, monitorPing, setMuted } from "../lib/sound";
import { hintsDisabled, setHintsDisabled } from "../lib/hints";
import { BurgerMenu } from "./BurgerMenu";

/** Ancho visible del electro, en unidades del viewBox. */
const ECG_WIDTH = 110;
const ECG_HEIGHT = 26;
/** Separación entre latidos en reposo. Al subir el pulso se acorta: caben más picos. */
const BEAT_WIDTH_AT_REST = 44;
/** Duración del ciclo en reposo. Es lo que tarda la onda en avanzar un latido. */
const ECG_CYCLE_MS = 2200;
/** El pulso se redondea a estos escalones antes de dibujar, para no rehacer la traza
 *  cada segundo mientras decae. */
const BPM_STEP = 6;
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
  /** Tu nombre en la sala. Se edita aquí porque es el que firma cada intervención. */
  nickname: string;
  nicknameColor: string;
  onRename: (nickname: string) => void;
  /** Pedir un paciente nuevo. Lo decide el agente, que puede negarse. */
  onNewGame: () => void;
  sessionSeconds: number;
  /** Cambia con cada ronda: cada paciente tiene su propio expediente. */
  expediente: string;
  onShowHelp: () => void;
  /**
   * Cabecera del shell móvil: una fila, la bolita late en vez del electro, y los mandos
   * se recogen en el menú ☰. Prop y no hook interno para que el preview pueda forzarla.
   */
  compact?: boolean;
}

/**
 * El latido de la bolita compacta: una sístole rápida al arranque de cada ciclo y
 * reposo el resto — el equivalente en un solo punto del pico R del electro.
 */
const DOT_BEAT: Keyframe[] = [
  { transform: "scale(1)", opacity: 0.55, offset: 0 },
  { transform: "scale(1.55)", opacity: 1, offset: 0.07 },
  { transform: "scale(1)", opacity: 0.55, offset: 0.24 },
  { transform: "scale(1)", opacity: 0.55, offset: 1 },
];

/** La cabecera del monitor: identidad del paciente, pulso, reloj y aforo. */
export function Monitor({
  bpm,
  nickname,
  nicknameColor,
  onRename,
  onNewGame,
  sessionSeconds,
  expediente,
  onShowHelp,
  compact = false,
}: MonitorProps) {
  const bpmColor = bpm > BPM_ALARM ? T.alarm : T.vital;
  const [silenced, setSilenced] = useState(isMuted);
  const [noHints, setNoHints] = useState(hintsDisabled);
  const [renaming, setRenaming] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const traceRef = useRef<SVGGElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  // Cuanto más alto el pulso, más juntos los latidos y más rápido avanza la traza: la
  // onda no solo va más deprisa, también se ve más apretada. Es lo que hace un monitor
  // de verdad, y se lee de un vistazo desde el fondo de la sala.
  //
  // El pulso se cuantiza antes de dibujar: decae de uno en uno cada segundo, y rehacer la
  // traza a cada cambio provocaba un tirón por segundo.
  const visualBpm = Math.max(BPM_RESTING, Math.round(bpm / BPM_STEP) * BPM_STEP);
  const rate = visualBpm / BPM_RESTING;
  const beatWidth = BEAT_WIDTH_AT_REST / rate;
  const period = ECG_CYCLE_MS / rate;
  const alarming = bpm > BPM_ALARM;

  const trace = useMemo(() => buildTrace(beatWidth), [beatWidth]);

  const alarmingRef = useRef(alarming);
  alarmingRef.current = alarming;

  // Una ÚNICA animación infinita, no una por latido. Como la onda es periódica con el
  // ancho de latido, trasladarla justo un latido es visualmente idéntico a no moverla:
  // el bucle no tiene costura. Antes se cancelaba y recreaba en cada bip, y como
  // `setTimeout` deriva, al llegar tarde la animación ya había terminado y el reinicio
  // daba un tirón hacia atrás.
  useEffect(() => {
    // En compacto late la bolita; en completo se desplaza la traza del electro. El
    // resto del mecanismo — el reloj, el bip, la resincronización — es exactamente
    // el mismo, que para eso está verificado.
    const target: HTMLElement | SVGGElement | null = compact
      ? dotRef.current
      : traceRef.current;
    if (!target) return;

    const keyframes: Keyframe[] = compact
      ? DOT_BEAT
      : [{ transform: "translateX(0px)" }, { transform: `translateX(${-beatWidth}px)` }];

    /**
     * Arranca la animación. Con `preservePhase`, retoma justo donde iba la anterior (para
     * que un cambio de pulso no salte). Sin él, arranca limpia desde el pico.
     *
     * El navegador congela `currentTime` en cuanto la pestaña pasa a segundo plano —
     * verificado en vivo: 27 s con la pestaña oculta y ni un milisegundo de avance—, y dejan
     * de llegar frames de `requestAnimationFrame`. "Preservar la fase" leyendo ese reloj
     * congelado al volver no tiene sentido (el tiempo real que pasó no está en ningún
     * sitio), y era justo lo que producía el salto hacia atrás y el bip espaciado que se
     * veía al cambiar de pestaña y volver.
     */
    function startAnimation(preservePhase: boolean) {
      const previous = target!.getAnimations()[0];
      const previousPeriod = Number(previous?.effect?.getTiming().duration) || 0;
      const phase =
        preservePhase && previous && previousPeriod > 0
          ? ((Number(previous.currentTime) || 0) % previousPeriod) / previousPeriod
          : 0;
      previous?.cancel();

      const next = target!.animate(keyframes, {
        duration: period,
        iterations: Infinity,
        easing: "linear",
      });
      next.currentTime = phase * period;
      return next;
    }

    let animation = startAnimation(true);

    // El bip se dispara cuando la animación cruza un límite de iteración, que es justo
    // cuando un pico R queda sobre la referencia. Se vigila con el reloj de la propia
    // animación, no con un temporizador aparte, así que no puede desincronizarse.
    let previousIteration = 0;
    let frame = 0;
    const watch = () => {
      const iteration = Math.floor(Number(animation.currentTime) / period);
      if (iteration !== previousIteration) {
        previousIteration = iteration;
        monitorPing(alarmingRef.current);
      }
      frame = requestAnimationFrame(watch);
    };
    monitorPing(alarmingRef.current);
    frame = requestAnimationFrame(watch);

    function onVisible() {
      if (document.visibilityState !== "visible") return;
      cancelAnimationFrame(frame);
      animation.cancel();
      animation = startAnimation(false);
      previousIteration = 0;
      monitorPing(alarmingRef.current);
      frame = requestAnimationFrame(watch);
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      cancelAnimationFrame(frame);
      animation.cancel();
    };
  }, [beatWidth, period, compact]);

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

  // La cabecera móvil: una sola fila. Sin expediente (ya vive en el título de la
  // pestaña y en el marcador de desenlace) y sin reloj — en 375px, algo tenía que caer.
  if (compact) {
    return (
      <div
        style={{
          height: 48,
          flex: "none",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 10px 0 14px",
          background: T.monitorBg,
          borderBottom: `1px solid ${T.monitorBorder}`,
          fontFamily: FONT.mono,
          color: T.textMono,
          fontSize: SIZE.small,
          letterSpacing: ".08em",
        }}
      >
        <span
          ref={dotRef}
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: bpmColor,
            flex: "none",
          }}
        />
        <span style={{ color: T.textBright, fontWeight: 600 }}>EL PACIENTE</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: bpmColor, fontWeight: 600, fontSize: SIZE.lead }}>{bpm}</span>
        <span style={{ color: T.textDim }}>LPM</span>
        <BurgerMenu
          nickname={nickname}
          nicknameColor={nicknameColor}
          onRename={onRename}
          onNewGame={onNewGame}
          onShowHelp={onShowHelp}
          silenced={silenced}
          onToggleSound={toggleSound}
          noHints={noHints}
          onToggleHints={toggleHints}
        />
      </div>
    );
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
        fontSize: SIZE.small,
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
        <span style={{ color: bpmColor, fontWeight: 600, fontSize: SIZE.lead }}>{bpm}</span>
        <span style={{ color: T.textDim }}>LPM</span>
      </div>

      <div style={{ flex: 1 }} />
      <span style={{ color: T.textDim }} title="Tiempo que lleva vivo este paciente">
        EN QUIRÓFANO {formatClock(sessionSeconds)}
      </span>
      {renaming ? (
        <input
          className="chat-input"
          defaultValue={nickname}
          autoFocus
          maxLength={24}
          aria-label="Cambiar tu nombre en la sala"
          onBlur={(event) => {
            onRename(event.target.value);
            setRenaming(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            else if (event.key === "Escape") setRenaming(false);
          }}
          style={{
            width: 140,
            boxSizing: "border-box",
            background: T.chatInputBg,
            border: `1px solid ${T.chatInputBorder}`,
            color: nicknameColor,
            fontFamily: FONT.mono,
            fontSize: SIZE.small,
            padding: "3px 8px",
            borderRadius: 2,
            outline: "none",
          }}
        />
      ) : (
        <button
          type="button"
          title="Haz clic para cambiar tu nombre"
          onClick={() => setRenaming(true)}
          style={{
            fontFamily: FONT.mono,
            fontSize: SIZE.small,
            color: nicknameColor,
            background: "transparent",
            border: `1px solid ${T.monitorBorder}`,
            borderRadius: 2,
            height: 22,
            padding: "0 9px",
            cursor: "pointer",
          }}
        >
          @{nickname}
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          if (confirmNew) {
            onNewGame();
            setConfirmNew(false);
          } else {
            setConfirmNew(true);
            setTimeout(() => setConfirmNew(false), 4000);
          }
        }}
        title="Traer un paciente nuevo"
        aria-label="Traer un paciente nuevo"
        style={{
          fontFamily: FONT.mono,
          fontSize: SIZE.small,
          letterSpacing: ".08em",
          color: confirmNew ? T.alarm : T.textDim,
          background: "transparent",
          border: `1px solid ${confirmNew ? T.alarm : T.monitorBorder}`,
          borderRadius: 2,
          height: 22,
          padding: "0 9px",
          cursor: "pointer",
        }}
      >
        {confirmNew ? "¿SEGURO?" : "NUEVA PARTIDA"}
      </button>
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
          fontSize: SIZE.small,
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
        fontSize: SIZE.micro,
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
