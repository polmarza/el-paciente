import { useEffect, useRef } from "react";
import type { LogEntry } from "@el-paciente/shared";
import { FONT, T, SIZE } from "../theme";
import { LogEntries } from "./EditLog";

/**
 * El historial clínico como pestaña a pantalla completa. Solo existe en el shell móvil:
 * en escritorio el historial es un cajón dentro del panel del cerebro, pero en un
 * teléfono un cajón que se despliega taparía justo la mesa que estás mirando.
 */
export function HistorialPane({ log }: { log: LogEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // El historial se pinta del más reciente al más antiguo, así que lo nuevo entra por
  // arriba: al llegar entradas, volvemos al principio para que se vean.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [log.length]);

  return (
    <div
      className="paciente-historial"
      style={{
        display: "flex",
        flexDirection: "column",
        background: T.brainBg,
        minWidth: 0,
      }}
    >
      <div
        style={{
          flex: "none",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "13px 18px 11px",
          fontFamily: FONT.mono,
          fontSize: SIZE.micro,
          letterSpacing: ".16em",
          color: T.textDim,
          borderBottom: `1px solid ${T.brainRule}`,
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
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "12px 18px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 9,
          fontFamily: FONT.mono,
          fontSize: SIZE.small,
        }}
      >
        <LogEntries log={log} />
      </div>
    </div>
  );
}
