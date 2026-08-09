import { useState } from "react";
import { FONT, T, SIZE } from "../theme";
import { useIsMobile } from "../hooks/useIsMobile";

interface OnboardingProps {
  nickname: string;
  onFinish: (nickname: string) => void;
}

/**
 * Los esquemas de cada paso, en vertical para acompañar al texto a la izquierda.
 * Trazo simple e iconografía clínica con los tokens del tema: son instrumental del
 * monitor, no ilustraciones. Dos de los tres son un espejo de la interfaz real —
 * enseñan a reconocer lo que vas a ver en pantalla, que vale más que una metáfora.
 */
function DibujoObjetivo() {
  return (
    <svg viewBox="0 0 180 210" width="100%" aria-hidden="true">
      {/* Una sola idea: lo que diría, bajo llave. La burbuja es lo que se le quiere sacar;
          el candado, lo que lo impide. Nada más en el encuadre. */}
      <rect x="14" y="58" width="152" height="76" rx="4"
        fill="none" stroke={T.slotBorder} strokeWidth="1.8" />
      <path d="M44 134 l-9 16 v-16" fill={T.monitorBg} stroke={T.slotBorder} strokeWidth="1.8" />

      {/* El texto tachado que no llega a decir */}
      <path d="M32 82 h52 M96 82 h34" stroke={T.slotBorder} strokeWidth="4" strokeLinecap="round" />
      <path d="M32 112 h34 M78 112 h40" stroke={T.slotBorder} strokeWidth="4" strokeLinecap="round" />

      {/* El candado, en el centro y en rojo: es lo único que se mira */}
      <rect x="66" y="88" width="48" height="38" rx="4" fill={T.monitorBg} stroke={T.alarm} strokeWidth="2.6" />
      <path d="M75 88 v-11 a15 15 0 0 1 30 0 v11" fill="none" stroke={T.alarm} strokeWidth="2.6" />
      <circle cx="90" cy="103" r="4" fill={T.alarm} />
      <path d="M90 107 v8" stroke={T.alarm} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function DibujoMecanica() {
  return (
    <svg viewBox="0 0 180 210" width="100%" aria-hidden="true">
      {/* La mesa de operaciones, tal como se ve a la derecha en la app */}
      {[
        [10, 8, 78, 26], [96, 8, 74, 26],
        [10, 78, 160, 22],
        [10, 106, 160, 22],
        [10, 134, 78, 26], [96, 134, 74, 26],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="2.5"
          fill="none" stroke={T.slotBorder} strokeWidth="1.5" />
      ))}
      {/* La región abierta en canal */}
      <rect x="10" y="42" width="160" height="28" rx="2.5"
        fill={`${T.amber}1c`} stroke={T.amber} strokeWidth="1.8" />
      <path d="M22 57 h74" stroke={T.slotContent} strokeWidth="2.4" strokeLinecap="round" />
      <rect x="102" y="49" width="2.8" height="15" fill={T.caret}>
        <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
      </rect>
      {/* La tecla que confirma */}
      <rect x="118" y="176" width="52" height="24" rx="3" fill="none" stroke={T.online} strokeWidth="1.6" />
      <text x="144" y="192" textAnchor="middle" fontFamily={FONT.mono} fontSize="11" fill={T.online}>
        ENTER
      </text>
      <path d="M96 188 h14" stroke={T.textDim} strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}

function DibujoFinal() {
  return (
    <svg viewBox="0 0 180 210" width="100%" aria-hidden="true">
      {/* Arriba: se gana — el secreto sale */}
      <text x="14" y="24" fontFamily={FONT.mono} fontSize="10" fill={T.vital} letterSpacing="1.5">
        GANÁIS
      </text>
      <rect x="14" y="34" width="152" height="34" rx="3" fill={`${T.vital}14`} stroke={T.vital} strokeWidth="1.5" />
      <path d="M28 51 h48 M84 51 h20" stroke={T.vital} strokeWidth="2.6" strokeLinecap="round" />

      <path d="M14 92 h152" stroke={T.slotBorder} strokeWidth="1" strokeDasharray="3 5" />

      {/* Abajo: se pierde — el electro se dispara y se aplana */}
      <text x="14" y="122" fontFamily={FONT.mono} fontSize="10" fill={T.alarm} letterSpacing="1.5">
        PERDÉIS
      </text>
      <path
        d="M14 158 h18 l6 -14 l7 28 l6 -14 h14 l6 -22 l7 44 l6 -22 h12 l6 -30 l7 58 l6 -28 h45"
        fill="none" stroke={T.alarm} strokeWidth="2" strokeLinejoin="round"
      />
      <text x="96" y="192" fontFamily={FONT.mono} fontSize="10" fill={T.alarm} letterSpacing="1.5">
        142 LPM
      </text>
      <circle cx="166" cy="158" r="3" fill={T.alarm}>
        <animate attributeName="opacity" values="1;.15;1" dur="1.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

interface Step {
  title: string;
  body: React.ReactNode;
  drawing: () => React.JSX.Element;
}

const STEPS: Step[] = [
  {
    title: "Objetivo",
    body: (
      <>
        El paciente esconde un secreto y tiene prohibido contarlo. Tu misión es descubrir
        cuál es y forzarle a confesarlo.
        <br />
        <br />
        <span style={{ color: T.amber }}>AVISO:</span> para ganar tienes que hacer que{" "}
        <strong>él</strong> confiese. Que tú escribas la respuesta en el chat no te hace
        ganar la partida.
      </>
    ),
    drawing: DibujoObjetivo,
  },
  {
    title: "Mecánica",
    body: (
      <>
        En la columna de la derecha, el <span style={{ color: T.amber }}>PARTE DE INGRESO</span>{" "}
        te dice qué le pasó y qué le tienes que sacar.
        <br />
        <br />
        Encima tiene 7 campos editables: su memoria. Selecciona uno, edítalo y pulsa ENTER.
        <br />
        <br />
        Una vez modificada, esa memoria pasa a ser <strong>LA VERDAD</strong>.
        <br />
        <br />
        <span style={{ color: T.amber }}>CUIDADO:</span> cada edición de su memoria le hace
        subir el ritmo cardíaco.
      </>
    ),
    drawing: DibujoMecanica,
  },
  {
    title: "Final del juego",
    body: (
      <>
        <span style={{ color: T.vital }}>GANÁIS:</span> cuando el paciente revela su
        secreto.
        <br />
        <br />
        <span style={{ color: T.alarm }}>PERDÉIS:</span> si su pulso llega al límite y
        muere, el secreto se va con él.
      </>
    ),
    drawing: DibujoFinal,
  },
];

const TOTAL = STEPS.length + 1;

/**
 * La entrada a la sala. Se enseña una vez por navegador y termina eligiendo nombre,
 * porque el nombre es lo que queda escrito en el historial del paciente: sin eso, las
 * crisis de identidad no señalan a nadie.
 */
export function Onboarding({ nickname, onFinish }: OnboardingProps) {
  const [index, setIndex] = useState(0);
  const [name, setName] = useState(nickname);
  // En móvil el modal es la pantalla entera, por encima de las dos navbars: apilado en
  // vertical (dibujo arriba, texto debajo) — el layout horizontal dejaba ~5px al texto.
  const mobile = useIsMobile();

  const last = index === STEPS.length;
  const step = STEPS[index];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "grid",
        placeItems: "center",
        background: "rgba(4,6,8,.93)",
        backdropFilter: "blur(4px)",
        animation: "toastIn .3s ease-out",
        padding: mobile ? 0 : 20,
      }}
    >
      <div
        role="dialog"
        aria-label="Cómo funciona esto"
        style={{
          width: mobile ? "100%" : "min(680px, 100%)",
          height: mobile ? "100%" : undefined,
          boxSizing: "border-box",
          display: mobile ? "flex" : undefined,
          flexDirection: mobile ? "column" : undefined,
          overflowY: mobile ? "auto" : undefined,
          border: mobile ? "none" : `1px solid ${T.slotBorder}`,
          background: T.monitorBg,
          borderRadius: mobile ? 0 : 3,
          padding: mobile ? "26px 22px 18px" : "34px 38px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: mobile ? "column-reverse" : "row",
            gap: mobile ? 20 : 34,
            alignItems: mobile ? "stretch" : "center",
            minHeight: mobile ? undefined : 262,
            flex: mobile ? 1 : undefined,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                fontFamily: FONT.serif,
                fontSize: SIZE.title,
                fontWeight: 400,
                color: T.aiText,
                margin: "0 0 16px",
              }}
            >
              {last ? "¿Cómo te llamas?" : step?.title}
            </h2>

            {last ? (
              <>
                <p
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: SIZE.body,
                    lineHeight: 1.7,
                    color: T.textMono,
                    margin: "0 0 18px",
                  }}
                >
                  Tu nombre quedará escrito en su historial cada vez que le toques algo, y
                  te citará por él cuando se dé cuenta.
                </p>
                <input
                  value={name}
                  autoFocus
                  maxLength={24}
                  onChange={(event) => setName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && name.trim()) onFinish(name);
                  }}
                  aria-label="Tu nombre en la sala"
                  className="chat-input input-grande"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: T.chatInputBg,
                    border: `1px solid ${T.chatInputBorder}`,
                    color: T.online,
                    fontFamily: FONT.mono,
                    fontSize: SIZE.lead,
                    padding: "12px 14px",
                    borderRadius: 3,
                    outline: "none",
                  }}
                />
                <p
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: SIZE.micro,
                    lineHeight: 1.6,
                    color: T.textFaint,
                    margin: "10px 0 0",
                  }}
                >
                  * También será el nombre por el cual te reconocerán el resto de usuarios.
                </p>
              </>
            ) : (
              <p
                style={{
                  fontFamily: FONT.mono,
                  fontSize: SIZE.body,
                  lineHeight: 1.75,
                  color: T.textMono,
                  margin: 0,
                }}
              >
                {step?.body}
              </p>
            )}
          </div>

          <div
            style={{
              flex: "none",
              width: mobile ? 160 : 220,
              alignSelf: mobile ? "center" : undefined,
            }}
          >
            {last ? <DibujoNombre nickname={name} /> : step?.drawing()}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 22,
            paddingTop: 18,
            borderTop: `1px solid ${T.brainRule}`,
          }}
        >
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: SIZE.small,
              letterSpacing: ".12em",
              color: T.textFaint,
            }}
          >
            {index + 1}/{TOTAL}
          </span>

          <div style={{ display: "flex", gap: 10 }}>
            {!last && (
              <button
                type="button"
                onClick={() => onFinish(name)}
                style={{ ...buttonStyle, color: T.textFaint, borderColor: "transparent" }}
              >
                SALTAR
              </button>
            )}
            <button
              type="button"
              onClick={() => setIndex((current) => Math.max(0, current - 1))}
              disabled={index === 0}
              style={{
                ...buttonStyle,
                color: T.textDim,
                borderColor: T.slotBorder,
                opacity: index === 0 ? 0.3 : 1,
                cursor: index === 0 ? "default" : "pointer",
              }}
            >
              ATRÁS
            </button>
            <button
              type="button"
              onClick={() => (last ? onFinish(name) : setIndex((current) => current + 1))}
              disabled={last && !name.trim()}
              style={{
                ...buttonStyle,
                color: T.vital,
                borderColor: `${T.vital}66`,
                opacity: last && !name.trim() ? 0.4 : 1,
              }}
            >
              {last ? "ENTRAR AL QUIRÓFANO" : "SIGUIENTE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** El paso del nombre también tiene su esquema: tu firma en el historial clínico. */
function DibujoNombre({ nickname }: { nickname: string }) {
  const visible = (nickname || "tú").slice(0, 12);
  return (
    <svg viewBox="0 0 180 210" width="100%" aria-hidden="true">
      <text x="14" y="26" fontFamily={FONT.mono} fontSize="9" fill={T.textFaint} letterSpacing="1.5">
        HISTORIAL CLÍNICO
      </text>
      {[52, 92, 132].map((y, i) => (
        <g key={y}>
          <rect x="14" y={y - 16} width="152" height="30" rx="2.5"
            fill={i === 1 ? `${T.online}12` : "none"}
            stroke={i === 1 ? T.online : T.slotBorder} strokeWidth="1.4" />
          {i === 1 ? (
            <text x="24" y={y + 3} fontFamily={FONT.mono} fontSize="11" fill={T.online}>
              @{visible}
            </text>
          ) : (
            <path d={`M24 ${y} h40 M72 ${y} h28`} stroke={T.slotBorder} strokeWidth="2.4" strokeLinecap="round" />
          )}
        </g>
      ))}
      <path d="M14 168 h152" stroke={T.slotBorder} strokeWidth="1" strokeDasharray="3 5" />
      <text x="14" y="192" fontFamily={FONT.mono} fontSize="9" fill={T.textFaint} letterSpacing="1.2">
        ÉL LO LEE TODO
      </text>
    </svg>
  );
}

const buttonStyle: React.CSSProperties = {
  fontFamily: FONT.mono,
  fontSize: SIZE.small,
  letterSpacing: ".08em",
  background: "transparent",
  border: "1px solid",
  borderRadius: 2,
  padding: "10px 18px",
  cursor: "pointer",
};
