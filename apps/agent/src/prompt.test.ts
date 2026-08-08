import { describe, expect, it } from "vitest";
import { buildTurn } from "./prompt.ts";
import type { ChatMessage, LogEntry } from "@el-paciente/shared";
import { seedSnapshot } from "@el-paciente/shared";

const brain = {
  snapshot: seedSnapshot(),
  log: [],
  round: "cruce",
  expediente: "001-A",
  caso: "—",
  roundStartedAt: 0,
  roundEnd: null,
};

const trigger: LogEntry[] = [
  { id: "e1", at: 1, slot: "miedo", nickname: "pol", color: "#fff", prev: "antes", next: "ahora" },
];

function lastUserTurn(chat: ChatMessage[]) {
  const turns = buildTurn({ brain, chat, trigger, secret: "Valeria", weakness: "—" });
  return turns[turns.length - 1]?.content ?? "";
}

describe("buildTurn — edición y pregunta en el mismo turno", () => {
  it("si el último mensaje es una pregunta humana, no le miente diciendo que nadie preguntó", () => {
    const chat: ChatMessage[] = [
      { role: "human", nickname: "pol", color: "#fff", body: "¿En qué habitación estás?" },
    ];
    const content = lastUserTurn(chat);
    expect(content).not.toContain("sin que nadie te haya preguntado nada");
    expect(content).toContain("No dejes la pregunta sin contestar");
  });

  it("sin pregunta pendiente, mantiene el aviso de reacción espontánea", () => {
    const chat: ChatMessage[] = [{ role: "ai", body: "Ya se lo dije antes.", crisis: false }];
    const content = lastUserTurn(chat);
    expect(content).toContain("sin que nadie te haya preguntado nada");
  });

  it("sin chat previo tampoco le inventa una pregunta", () => {
    const content = lastUserTurn([]);
    expect(content).toContain("sin que nadie te haya preguntado nada");
  });
});
