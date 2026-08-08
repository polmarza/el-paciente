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

describe("normalize", () => {
  it("convierte los signos en separadores", () => {
    expect(normalize("¿Valeria? ¡Valeria!")).toBe("valeria valeria");
  });
});
