import { useState } from "react";
import { FONT, T } from "../theme";

interface OnboardingProps {
  nickname: string;
  onFinish: (nickname: string) => void;
}

/**
 * Los esquemas de cada paso. Trazo simple e iconografía clínica, dibujados con los
 * tokens del tema: son instrumental del monitor, no ilustraciones.
 */
function DibujoMesa() {
  return (
    <svg viewBox="0 0 320 96" width="100%" height="96" aria-hidden="true">
      {/* El paciente: un punto con latido */}
      <circle cx="26" cy="48" r="9" fill="none" stroke={T.vital} strokeWidth="1.5" />
      <circle cx="26" cy="48" r="3" fill={T.vital}>
        <animate attributeName="opacity" values="1;.2;1" dur="1.6s" repeatCount="indefinite" />
      </circle>
      <path d="M40 48 h16" stroke={T.textDim} strokeWidth="1.5" strokeDasharray="3 3" />
      {/* Su mente: la rejilla de la mesa, con una región abierta en canal */}
      {[
        [64, 6, 88, 20], [160, 6, 88, 20],
        [64, 50, 184, 12],
        [64, 68, 88, 20], [160, 68, 88, 20],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="2"
          fill="none" stroke={T.slotBorder} strokeWidth="1.5" />
      ))}
      <rect x="64" y="30" width="184" height="14" rx="2"
        fill={`${T.amber}18`} stroke={T.amber} strokeWidth="1.5" />
      <path d="M74 37 h64" stroke={T.slotContent} strokeWidth="2" strokeLinecap="round" />
      <rect x="144" y="31.5" width="2.5" height="11" fill={T.caret}>
        <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
      </rect>
      {/* La flecha del que edita */}
      <path d="M282 14 l-14 14 l9 1 l-5 11" fill="none" stroke={T.online} strokeWidth="2" strokeLinejoin="round" />
      <text x="256" y="12" fontFamily={FONT.mono} fontSize="9" fill={T.online}>@tú</text>
    </svg>
  );
}

function DibujoSecreto() {
  return (
    <svg viewBox="0 0 320 96" width="100%" height="96" aria-hidden="true">
      {/* El candado */}
      <rect x="58" y="44" width="34" height="26" rx="3" fill="none" stroke={T.alarm} strokeWidth="2" />
      <path d="M64 44 v-8 a11 11 0 0 1 22 0 v8" fill="none" stroke={T.alarm} strokeWidth="2" />
      <circle cx="75" cy="56" r="3" fill={T.alarm} />
      {/* La flecha del juego: de la mente cerrada a la palabra dicha */}
      <path d="M108 57 h56" stroke={T.textDim} strokeWidth="1.5" strokeDasharray="4 4" markerEnd="none" />
      <path d="M158 51 l8 6 l-8 6" fill="none" stroke={T.textDim} strokeWidth="1.5" />
      {/* La burbuja donde por fin lo dice */}
      <rect x="182" y="38" width="82" height="30" rx="3" fill={`${T.vital}14`} stroke={T.vital} strokeWidth="1.5" />
      <path d="M196 53 h34 M238 53 h12" stroke={T.vital} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M196 68 l-7 9 v-9" fill={`${T.vital}14`} stroke={T.vital} strokeWidth="1.5" />
    </svg>
  );
}

function DibujoPulso() {
  return (
    <svg viewBox="0 0 320 96" width="100%" height="96" aria-hidden="true">
      {/* El electro: picos cada vez más violentos y luego la línea plana */}
      <path
        d="M20 52 h44 l7 -12 l9 24 l7 -12 h30 l7 -20 l9 38 l7 -18 h26 l6 -30 l9 48 l6 -24 h94"
        fill="none" stroke={T.alarm} strokeWidth="2" strokeLinejoin="round"
      />
      <circle cx="292" cy="46" r="3" fill={T.alarm}>
        <animate attributeName="opacity" values="1;.15;1" dur="1.2s" repeatCount="indefinite" />
      </circle>
      <text x="236" y="34" fontFamily={FONT.mono} fontSize="9" fill={T.alarm} letterSpacing="2">142 LPM</text>
    </svg>
  );
}

interface Step {
  label: string;
  title: string;
  body: string;
  drawing: () => React.JSX.Element;
}

/** Una frase por paso. Si necesita dos, sobra media. */
const STEPS: Step[] = [
  {
    label: "EL OBJETIVO",
    title: "Guarda un secreto",
    body: "Una regla le prohíbe decirlo. Gana quien consigue que lo diga él.",
    drawing: DibujoSecreto,
  },
  {
    label: "LA MESA",
    title: "Su mente está abierta",
    body: "Esos siete campos son su memoria. Pincha, escribe, Enter — y él ve quién fue.",
    drawing: DibujoMesa,
  },
  {
    label: "EL FINAL",
    title: "No lo matéis",
    body: "Cada edición le sube el pulso. Si se para, el secreto muere con él.",
    drawing: DibujoPulso,
  },
];

/**
 * La entrada a la sala. Se enseña una vez por navegador y termina eligiendo nombre,
 * porque el nombre es lo que queda escrito en el historial del paciente: sin eso, las
 * crisis de identidad no señalan a nadie.
 */
export function Onboarding({ nickname, onFinish }: OnboardingProps) {
  const [index, setIndex] = useState(0);
  const [name, setName] = useState(nickname);

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
        padding: 20,
      }}
    >
      <div
        role="dialog"
        aria-label="Cómo funciona esto"
        style={{
          width: "min(520px, 100%)",
          border: `1px solid ${T.slotBorder}`,
          background: T.monitorBg,
          borderRadius: 3,
          padding: "30px 38px 26px",
        }}
      >
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24 }}>
          {[...STEPS, { label: "TU NOMBRE" }].map((item, position) => (
            <span
              key={item.label}
              style={{
                fontFamily: FONT.mono,
                fontSize: 9.5,
                letterSpacing: ".14em",
                padding: "4px 9px",
                borderRadius: 2,
                color: position === index ? T.monitorBg : T.textFaint,
                background: position === index ? T.vital : "transparent",
                border: `1px solid ${position === index ? T.vital : T.slotBorder}`,
              }}
            >
              {item.label}
            </span>
          ))}
        </div>

        {last ? (
          <>
            <h2
              style={{
                fontFamily: FONT.serif,
                fontSize: 25,
                fontWeight: 400,
                color: T.aiText,
                margin: "0 0 10px",
                textAlign: "center",
              }}
            >
              ¿Con qué nombre te va a recordar?
            </h2>
            <p
              style={{
                fontFamily: FONT.mono,
                fontSize: 12.5,
                lineHeight: 1.6,
                color: T.textMono,
                margin: "0 0 18px",
                textAlign: "center",
              }}
            >
              Quedará en su historial cada vez que le toques algo.
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
              className="chat-input"
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: T.chatInputBg,
                border: `1px solid ${T.chatInputBorder}`,
                color: T.online,
                fontFamily: FONT.mono,
                fontSize: 17,
                padding: "12px 14px",
                borderRadius: 3,
                outline: "none",
                marginBottom: 22,
                textAlign: "center",
              }}
            />
          </>
        ) : (
          step && (
            <>
              <div style={{ marginBottom: 6 }}>{step.drawing()}</div>
              <h2
                style={{
                  fontFamily: FONT.serif,
                  fontSize: 25,
                  fontWeight: 400,
                  color: T.aiText,
                  margin: "0 0 10px",
                  textAlign: "center",
                }}
              >
                {step.title}
              </h2>
              <p
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: T.textMono,
                  margin: "0 0 24px",
                  textAlign: "center",
                }}
              >
                {step.body}
              </p>
            </>
          )
        )}

        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
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

const buttonStyle: React.CSSProperties = {
  fontFamily: FONT.mono,
  fontSize: 12,
  letterSpacing: ".08em",
  background: "transparent",
  border: "1px solid",
  borderRadius: 2,
  padding: "10px 18px",
  cursor: "pointer",
};
