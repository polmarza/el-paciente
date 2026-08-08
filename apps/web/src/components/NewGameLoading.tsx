import { FONT, T, SIZE } from "../theme";

/**
 * El hueco entre confirmar "nueva partida" y que pase algo en pantalla. La petición va y
 * vuelve por Portal hasta el agente y de vuelta — no es instantáneo — y sin esto no había
 * ninguna señal entre el clic y el marcador de desenlace, que se sentía como que la web se
 * había quedado colgada.
 *
 * No es carga optimista de verdad: el agente puede rechazar la petición (ronda recién
 * empezada, reinicio demasiado reciente), y en ese caso esto nunca llega a cerrarse solo —
 * lo hace el techo de tiempo en `App.tsx`. Lo que sí hace es decir "esto se está moviendo"
 * en vez de dejar la pantalla muda mientras se decide.
 */
export function NewGameLoading() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 45,
        display: "grid",
        placeItems: "center",
        background: "rgba(4,6,8,.6)",
        backdropFilter: "blur(2px)",
        animation: "toastIn .2s ease-out",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 26px",
          border: `1px solid ${T.slotBorder}`,
          background: T.monitorBg,
          borderRadius: 3,
          fontFamily: FONT.mono,
          fontSize: SIZE.small,
          letterSpacing: ".1em",
          color: T.textMono,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: T.vital,
            animation: "pulseDot 1s ease-in-out infinite",
          }}
        />
        PIDIENDO PACIENTE NUEVO…
      </div>
    </div>
  );
}
