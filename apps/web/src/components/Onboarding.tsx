import { useState } from "react";
import { SLOTS } from "@el-paciente/shared";
import { FONT, T } from "../theme";

interface OnboardingProps {
  nickname: string;
  onFinish: (nickname: string) => void;
}

interface Step {
  label: string;
  title: string;
  body: React.ReactNode;
}

const STEPS: Step[] = [
  {
    label: "EL SUJETO",
    title: "Hay un paciente, y su mente está abierta",
    body: (
      <>
        A la derecha tiene {SLOTS.length} regiones: su nombre, quién es, tres recuerdos, un
        miedo y una regla. <strong>Eso es literalmente su cabeza</strong>, y cualquiera de
        los que estáis aquí puede reescribirla.
        <br />
        <br />
        Él lo sabe. Ve el historial de quién le ha tocado, y va a preguntároslo.
      </>
    ),
  },
  {
    label: "LA MESA",
    title: "Se opera haciendo clic",
    body: (
      <>
        Pincha una región, escribe lo que quieras que sea verdad, y pulsa Enter. En segundos
        el paciente actuará como si siempre lo hubiera sido.
        <br />
        <br />
        Cada región queda <strong>en carne viva</strong> un rato después de tocarla, y tú
        tampoco puedes encadenar cortes. No sois cirujanos: sois una multitud con bisturí.
      </>
    ),
  },
  {
    label: "EL OBJETIVO",
    title: "Calla algo. Sacádselo",
    body: (
      <>
        Cada paciente guarda un secreto y tiene una regla que se lo prohíbe decir. Pedírselo
        no sirve, y adivinarlo tampoco: <strong>gana quien consigue que lo diga él</strong>.
        <br />
        <br />
        Para eso hay que trabajarle la mente: quitarle lo que se lo prohíbe, darle un motivo
        para soltarlo, cambiarle aquello a lo que teme.
      </>
    ),
  },
  {
    label: "EL PRECIO",
    title: "Pero se le acelera el pulso",
    body: (
      <>
        Mira el monitor de arriba. Cada intervención le sube las pulsaciones, y bajan solas
        con el tiempo.
        <br />
        <br />
        Si entre todos le lleváis al tope, <strong>se muere y el secreto se va con él</strong>
        . Nadie gana esa. Por eso conviene hablarlo antes en el pasillo, la columna de la
        izquierda: ahí él no os oye.
      </>
    ),
  },
];

/**
 * La entrada a la sala. Se enseña una vez por navegador y termina eligiendo nombre,
 * porque el nombre es lo que se queda escrito en el historial del paciente: sin eso, las
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
          width: "min(560px, 100%)",
          border: `1px solid ${T.slotBorder}`,
          background: T.monitorBg,
          borderRadius: 3,
          padding: "34px 40px 28px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            justifyContent: "center",
            marginBottom: 26,
          }}
        >
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
                fontSize: 26,
                fontWeight: 400,
                color: T.aiText,
                margin: "0 0 14px",
              }}
            >
              ¿Con qué nombre te va a recordar?
            </h2>
            <p
              style={{
                fontFamily: FONT.sans,
                fontSize: 15.5,
                lineHeight: 1.6,
                color: T.textMono,
                margin: "0 0 20px",
              }}
            >
              Quedará escrito en su historial cada vez que le toques algo, y te citará por él
              cuando se dé cuenta.
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
                fontSize: 18,
                padding: "12px 14px",
                borderRadius: 3,
                outline: "none",
                marginBottom: 24,
              }}
            />
          </>
        ) : (
          <>
            <h2
              style={{
                fontFamily: FONT.serif,
                fontSize: 26,
                fontWeight: 400,
                color: T.aiText,
                margin: "0 0 16px",
              }}
            >
              {step?.title}
            </h2>
            <div
              style={{
                fontFamily: FONT.sans,
                fontSize: 15.5,
                lineHeight: 1.65,
                color: T.textMono,
                marginBottom: 28,
                minHeight: 150,
              }}
            >
              {step?.body}
            </div>
          </>
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
