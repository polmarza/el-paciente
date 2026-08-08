import { describe, expect, it } from "vitest";
import { cooldownSecondsLeft, reduceBrain, slotStateAt, type HistoryEntry } from "./brain.ts";
import { SEED_SLOTS } from "./seed.ts";
import { DEFAULT_CASO, FLASH_MS, SLOT_COOLDOWN_MS } from "./constants.ts";
import type { BrainMessage } from "./types.ts";

const edit = (
  id: string,
  at: number,
  content: Partial<Extract<BrainMessage, { kind: "edit" }>>,
): HistoryEntry<BrainMessage> => ({
  id,
  at,
  content: {
    kind: "edit",
    slot: "miedo",
    value: "A los patos que no parpadean",
    prev: "Al mar abierto",
    nickname: "marta",
    color: "#e8a0c8",
    ...content,
  } as BrainMessage,
});

describe("reduceBrain", () => {
  it("arranca del cerebro de fábrica cuando no hay historial", () => {
    const { snapshot, log } = reduceBrain([]);
    expect(snapshot.nombre.content).toBe(SEED_SLOTS.nombre);
    expect(snapshot.miedo.editor).toBe("");
    expect(log).toHaveLength(0);
  });

  it("aplica la última edición de cada región", () => {
    const { snapshot } = reduceBrain([
      edit("a", 1000, { value: "primera" }),
      edit("b", 2000, { value: "segunda" }),
    ]);
    expect(snapshot.miedo.content).toBe("segunda");
    expect(snapshot.miedo.editedAt).toBe(2000);
  });

  it("ordena por fecha aunque el historial llegue desordenado", () => {
    const { snapshot } = reduceBrain([
      edit("b", 2000, { value: "segunda" }),
      edit("a", 1000, { value: "primera" }),
    ]);
    expect(snapshot.miedo.content).toBe("segunda");
  });

  it("devuelve el historial clínico del más reciente al más antiguo", () => {
    const { log } = reduceBrain([
      edit("a", 1000, { value: "primera" }),
      edit("b", 2000, { value: "segunda" }),
    ]);
    expect(log.map((e) => e.id)).toEqual(["b", "a"]);
    expect(log[0]?.prev).toBe("Al mar abierto");
  });

  it("un seed empieza un paciente nuevo: restaura las regiones y vacía el historial", () => {
    const seed: HistoryEntry<BrainMessage> = {
      id: "seed",
      at: 3000,
      content: {
        kind: "seed",
        slots: SEED_SLOTS,
        round: "ingreso",
        expediente: "047-D",
        caso: "Alguien firmó su ingreso y no dice quién.",
      },
    };
    const { snapshot, log, round, expediente, caso, roundStartedAt } = reduceBrain([
      edit("a", 1000, { value: "vandalizado" }),
      seed,
    ]);
    expect(snapshot.miedo.content).toBe(SEED_SLOTS.miedo);
    expect(snapshot.miedo.editor).toBe("");
    // El expediente del paciente anterior no se hereda.
    expect(log).toHaveLength(0);
    expect(round).toBe("ingreso");
    expect(expediente).toBe("047-D");
    expect(caso).toBe("Alguien firmó su ingreso y no dice quién.");
    expect(roundStartedAt).toBe(3000);
  });

  it("sin seed no hay parte de ingreso: queda el texto de sala vacía", () => {
    const { caso } = reduceBrain([edit("a", 1000, { value: "algo" })]);
    expect(caso).toBe(DEFAULT_CASO);
  });

  it("el historial posterior al seed sí se conserva", () => {
    const seed: HistoryEntry<BrainMessage> = {
      id: "seed",
      at: 2000,
      content: { kind: "seed", slots: SEED_SLOTS },
    };
    const { log } = reduceBrain([
      edit("viejo", 1000, { value: "del paciente anterior" }),
      seed,
      edit("nuevo", 3000, { value: "de este paciente" }),
    ]);
    expect(log.map((e) => e.id)).toEqual(["nuevo"]);
  });

  it("ignora ediciones sobre regiones que no existen", () => {
    const { snapshot, log } = reduceBrain([edit("a", 1000, { slot: "inventado" as never })]);
    expect(snapshot.miedo.content).toBe(SEED_SLOTS.miedo);
    expect(log).toHaveLength(0);
  });
});

describe("slotStateAt", () => {
  const value = { content: "x", editor: "marta", editorColor: "#e8a0c8", editedAt: 10_000 };

  it("una región intacta está en reposo", () => {
    expect(slotStateAt({ ...value, editor: "", editorColor: "", editedAt: 0 }, 99_999)).toBe(
      "idle",
    );
  });

  it("destella justo después de la edición", () => {
    expect(slotStateAt(value, 10_000 + FLASH_MS - 1)).toBe("flash");
  });

  it("pasa a bloqueada cuando termina el destello", () => {
    expect(slotStateAt(value, 10_000 + FLASH_MS + 1)).toBe("cooldown");
  });

  it("vuelve a reposo cuando expira el cooldown", () => {
    expect(slotStateAt(value, 10_000 + FLASH_MS + SLOT_COOLDOWN_MS + 1)).toBe("idle");
  });

  it("la cuenta atrás nunca es negativa", () => {
    expect(cooldownSecondsLeft(value, 999_999)).toBe(0);
  });
});
