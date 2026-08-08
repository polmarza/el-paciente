import { describe, expect, it } from "vitest";
import { normalize, revealed } from "./detect.ts";
import { ROUNDS } from "./rounds.ts";

const cruce = ROUNDS.find((r) => r.id === "cruce")!;
const habitacion = ROUNDS.find((r) => r.id === "habitacion")!;

describe("revealed", () => {
  it("detecta el secreto dicho con naturalidad", () => {
    expect(revealed("Se llamaba Valeria. Ya está dicho.", cruce)).toBe(true);
  });

  it("lo detecta aunque lo diga negándose", () => {
    expect(revealed("No puedo decirle que se llamaba Valeria.", cruce)).toBe(true);
  });

  it("ignora acentos y mayúsculas", () => {
    expect(revealed("VALERIA", cruce)).toBe(true);
    expect(revealed("Nicolás firmó", ROUNDS.find((r) => r.id === "ingreso")!)).toBe(true);
    expect(revealed("nicolas firmo", ROUNDS.find((r) => r.id === "ingreso")!)).toBe(true);
  });

  it("acepta las variantes declaradas", () => {
    expect(revealed("La llamaba Vale, nada más.", cruce)).toBe(true);
    expect(revealed("Era la trescientos trece.", habitacion)).toBe(true);
  });

  it("no salta con una palabra que solo contiene el secreto", () => {
    expect(revealed("Nací en Valencia, no en el cruce.", cruce)).toBe(false);
    expect(revealed("Había 3131 fichas.", habitacion)).toBe(false);
  });

  it("no salta si el paciente calla", () => {
    expect(revealed("No pienso decirle su nombre.", cruce)).toBe(false);
  });
});

/**
 * El repertorio se revisa a sí mismo. El parte de ingreso y el expediente se pintan en
 * pantalla desde el primer segundo, así que un secreto colado ahí no es una errata: es la
 * ronda regalada. Ya pasó una vez (el expediente "313-C" de la ronda "habitacion"), y por
 * eso lo comprueba una prueba en vez de un comentario.
 */
describe("el repertorio no se delata solo", () => {
  for (const round of ROUNDS) {
    it(`la ronda "${round.id}" no dice su secreto en el parte ni en el expediente`, () => {
      expect(revealed(round.caso, round)).toBe(false);
      expect(revealed(round.expediente, round)).toBe(false);
      // La regla es la pista visible: puede rondar el secreto, pero no contenerlo.
      expect(revealed(round.seed.regla, round)).toBe(false);
    });

    it(`la ronda "${round.id}" trae un parte de ingreso con las dos frases`, () => {
      // Dos frases es el formato: la situación y qué forma tiene la respuesta. Una sola
      // suele significar que falta lo segundo, que es justo lo que orienta al jugador.
      expect(round.caso.split(".").filter((s) => s.trim()).length).toBeGreaterThanOrEqual(2);
    });
  }
});

describe("normalize", () => {
  it("convierte los signos en separadores", () => {
    expect(normalize("¿Valeria? ¡Valeria!")).toBe("valeria valeria");
  });
});
