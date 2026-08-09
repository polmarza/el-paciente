import { useRef, useState } from "react";
import { slotDef, type LogEntry } from "@el-paciente/shared";
import { FONT, T, SIZE } from "../theme";

/**
 * Altura de la pestaña cerrada: solo la barra de título. Es también el alto que la
 * columna reserva por debajo, para que el cajón cerrado no tape nada.
 */
export const LOG_HANDLE_HEIGHT = 38;

/** A cuánto se abre de un clic, sin arrastrar. */
const OPEN_HEIGHT = 280;

/** Aire que se le deja arriba: la mesa nunca queda del todo enterrada. */
const TOP_MARGIN = 76;

/** Menos de esto es un clic, no un arrastre. */
const DRAG_SLOP_PX = 4;

/**
 * El historial clínico: quién cortó qué y desde qué valor. La IA lee esto mismo.
 *
 * Vive en un cajón que se arrastra hacia arriba y **pasa por encima** de la mesa de
 * operaciones en lugar de comprimirla: las regiones son el juego y no deben moverse de
 * sitio cada vez que alguien quiere consultar el historial. Cerrado por defecto, porque
 * de entrada estorba más de lo que explica; la cifra de la pestaña avisa de que ahí
 * dentro está pasando algo.
 */
export function EditLog({ log }: { log: LogEntry[] }) {
  const [height, setHeight] = useState(LOG_HANDLE_HEIGHT);
  const panelRef = useRef<HTMLDivElement>(null);

  // Un arrastre en curso. En una ref y no en estado: cambia en cada pointermove y no
  // debe repintar por sí mismo.
  const drag = useRef<{ startY: number; startHeight: number; max: number; moved: boolean } | null>(
    null,
  );

  const open = height > LOG_HANDLE_HEIGHT;

  function clamp(value: number, max: number): number {
    return Math.min(max, Math.max(LOG_HANDLE_HEIGHT, value));
  }

  /** El techo depende de la altura real de la columna, así que se mide al agarrar. */
  function maxHeight(): number {
    const column = panelRef.current?.parentElement?.clientHeight ?? 600;
    return Math.max(LOG_HANDLE_HEIGHT, column - TOP_MARGIN);
  }

  function toggle() {
    setHeight((current) =>
      current > LOG_HANDLE_HEIGHT ? LOG_HANDLE_HEIGHT : clamp(OPEN_HEIGHT, maxHeight()),
    );
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startY: event.clientY, startHeight: height, max: maxHeight(), moved: false };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state) return;
    // Hacia arriba es crecer: la pantalla mide hacia abajo, el cajón sube.
    const delta = state.startY - event.clientY;
    if (Math.abs(delta) > DRAG_SLOP_PX) state.moved = true;
    setHeight(clamp(state.startHeight + delta, state.max));
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    drag.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    // Un clic sin desplazamiento es abrir o cerrar; si arrastró, se queda donde lo soltó.
    if (state && !state.moved) toggle();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
      return;
    }
    // Con el teclado se ajusta a pasos, que arrastrar con las flechas no se puede.
    const step = event.key === "ArrowUp" ? 40 : event.key === "ArrowDown" ? -40 : 0;
    if (!step) return;
    event.preventDefault();
    setHeight((current) => clamp(current + step, maxHeight()));
  }

  return (
    <div
      ref={panelRef}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height,
        zIndex: 5,
        display: "flex",
        flexDirection: "column",
        background: T.brainBg,
        borderTop: `1px solid ${T.brainRule}`,
        // La sombra despega el cajón de la mesa cuando la tapa.
        boxShadow: open ? "0 -14px 28px rgba(0,0,0,.55)" : "none",
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={
          open ? "Cerrar el historial clínico" : "Abrir el historial clínico. Arrastra para ajustar"
        }
        title="Arrastra hacia arriba para agrandarlo"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
        style={{
          flex: "none",
          height: LOG_HANDLE_HEIGHT,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 22px",
          fontFamily: FONT.mono,
          fontSize: SIZE.micro,
          letterSpacing: ".16em",
          color: T.textDim,
          cursor: "ns-resize",
          userSelect: "none",
          // Sin esto el navegador se queda el arrastre vertical y el cajón no sube.
          touchAction: "none",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: T.alarm,
            animation: "pulseDot 1.3s ease-in-out infinite",
          }}
        />
        <span>HISTORIAL CLÍNICO</span>
        {log.length > 0 && <span style={{ color: T.amberSoft }}>{log.length}</span>}
        <span style={{ flex: 1 }} />
        {/* Las asas de los cajones de verdad: dicen "de aquí se tira". */}
        <span aria-hidden="true" style={{ letterSpacing: ".3em", color: T.textFaint }}>
          ═
        </span>
        <span aria-hidden="true" style={{ color: T.textFaint }}>
          {open ? "▾" : "▴"}
        </span>
      </div>

      {open && (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "2px 22px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            fontFamily: FONT.mono,
            fontSize: SIZE.small,
          }}
        >
          <LogEntries log={log} />
        </div>
      )}
    </div>
  );
}

/**
 * Las líneas del historial, sin contenedor: las comparten el cajón de escritorio y la
 * pestaña HISTORIAL del shell móvil, cada uno con su propio scroll alrededor.
 */
export function LogEntries({ log }: { log: LogEntry[] }) {
  if (log.length === 0) {
    return (
      <div style={{ color: T.logPrev, lineHeight: 1.55 }}>
        Sin intervenciones. El paciente sigue siendo quien era.
      </div>
    );
  }
  return (
    <>
      {log.map((entry) => (
        <div key={entry.id} style={{ lineHeight: 1.55, color: T.logText }}>
          <span style={{ color: T.logTime }}>{clockOf(entry.at)}</span>{" "}
          <span style={{ color: entry.color, fontWeight: 600 }}>@{entry.nickname}</span> ·{" "}
          {slotDef(entry.slot)?.label ?? entry.slot} ·{" "}
          <span style={{ textDecoration: "line-through", color: T.logPrev }}>
            “{entry.prev}”
          </span>{" "}
          <span style={{ color: T.vital }}>→ “{entry.next}”</span>
        </div>
      ))}
    </>
  );
}

function clockOf(at: number): string {
  return new Date(at).toTimeString().slice(0, 8);
}
