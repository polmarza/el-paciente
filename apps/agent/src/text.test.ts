import { describe, expect, it } from "vitest";
import { trimToLastSentence } from "./text.ts";

describe("trimToLastSentence", () => {
  it("corta la frase incompleta que dejó el techo de tokens", () => {
    expect(trimToLastSentence("Me llamo Aurelio. Creo que sigo siendo yo, aunque el rec")).toBe(
      "Me llamo Aurelio.",
    );
  });

  it("respeta interrogaciones y exclamaciones de cierre", () => {
    expect(trimToLastSentence("¿Quién me escribió eso? Yo no tenía madre hace un min")).toBe(
      "¿Quién me escribió eso?",
    );
    expect(trimToLastSentence("¡No toque eso! Le decía que no me toc")).toBe("¡No toque eso!");
  });

  it("deja intacta una respuesta que ya termina en frase completa", () => {
    const complete = "Aurelio. Me llamo Aurelio.";
    expect(trimToLastSentence(complete)).toBe(complete);
  });

  it("devuelve el texto original si no hay ningún cierre de frase", () => {
    const sinCierre = "No sé dónde acabo yo";
    expect(trimToLastSentence(sinCierre)).toBe(sinCierre);
  });

  it("no devuelve una cadena vacía cuando el texto empieza por el signo de cierre", () => {
    expect(trimToLastSentence(". y entonces")).toBe(".");
  });
});
