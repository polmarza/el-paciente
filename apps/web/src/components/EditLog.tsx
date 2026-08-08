import { slotDef, type LogEntry } from "@el-paciente/shared";
import { FONT, T } from "../theme";

/** El historial clínico: quién cortó qué y desde qué valor. La IA lee esto mismo. */
export function EditLog({ log }: { log: LogEntry[] }) {
  return (
    <>
      <div
        style={{
          flex: "none",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 22px 8px",
          fontFamily: FONT.mono,
          fontSize: 11,
          letterSpacing: ".16em",
          color: T.textDim,
          borderTop: `1px solid ${T.brainRule}`,
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
        <span>HISTORIAL CLÍNICO — EDICIONES EN VIVO</span>
      </div>

      <div
        style={{
          // 150px es la altura del diseño; cede antes que la mesa de operaciones
          // cuando la pantalla va justa, porque las regiones importan más que el log.
          flex: "0 1 150px",
          minHeight: 84,
          overflowY: "auto",
          padding: "6px 22px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          fontFamily: FONT.mono,
          fontSize: 12.5,
        }}
      >
        {log.length === 0 ? (
          <div style={{ color: T.logPrev, lineHeight: 1.55 }}>
            Sin intervenciones. El paciente sigue siendo quien era.
          </div>
        ) : (
          log.map((entry) => (
            <div key={entry.id} style={{ lineHeight: 1.55, color: T.logText }}>
              <span style={{ color: T.logTime }}>{clockOf(entry.at)}</span>{" "}
              <span style={{ color: entry.color, fontWeight: 600 }}>@{entry.nickname}</span> ·{" "}
              {slotDef(entry.slot)?.label ?? entry.slot} ·{" "}
              <span style={{ textDecoration: "line-through", color: T.logPrev }}>
                “{entry.prev}”
              </span>{" "}
              <span style={{ color: T.vital }}>→ “{entry.next}”</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function clockOf(at: number): string {
  return new Date(at).toTimeString().slice(0, 8);
}
