import { FONT, T, SIZE } from "../theme";

/**
 * El parte de ingreso: dos frases que dicen qué se está investigando.
 *
 * Sin esto la partida empieza sin briefing — ves siete campos de memoria y sabes que hay
 * un secreto, pero no qué forma tiene ni por dónde empezar a tirar. El texto llega con el
 * seed de la ronda (lo escribe el agente, que es quien conoce el caso) y nunca contiene la
 * respuesta: sitúa la escena y dice si lo que buscas es un nombre, un lugar o un número.
 */
export function CaseBrief({ caso }: { caso: string }) {
  return (
    <div
      style={{
        flex: "none",
        padding: "12px 22px 14px",
        borderTop: `1px solid ${T.brainRule}`,
        background: "rgba(224,164,60,.04)",
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: SIZE.micro,
          letterSpacing: ".16em",
          color: T.amberSoft,
          marginBottom: 7,
        }}
      >
        PARTE DE INGRESO
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: FONT.mono,
          fontSize: SIZE.small,
          lineHeight: 1.6,
          color: T.textMono,
        }}
      >
        {caso}
      </p>
    </div>
  );
}
