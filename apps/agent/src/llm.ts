import { env } from "./env.ts";
import { trimToLastSentence } from "./text.ts";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
/** Si un turno tarda más que esto, la demo ya se ha roto: mejor cortar y reintentar. */
const TIMEOUT_MS = 15_000;
/**
 * Quien controla la longitud es la regla de brevedad del prompt; esto es solo la red por
 * si divaga. A 100 la red cortaba respuestas normales y el recorte las descartaba en
 * silencio, así que se ensancha: mejor que casi nunca llegue a actuar.
 */
const MAX_TOKENS = 160;

export interface ChatTurn {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Un turno de EL PACIENTE. No usamos streaming: el agente publica la frase entera y
 * es el navegador quien la teclea en vivo, así que lo único que importa aquí es la
 * latencia total, y una respuesta corta de un modelo rápido llega en ~1 s.
 */
export async function complete(messages: ChatTurn[]): Promise<string> {
  try {
    return await callModel(env.model, messages);
  } catch (error) {
    console.warn(`[llm] ${env.model} falló (${describe(error)}); pruebo el de respaldo.`);
    return callModel(env.fallbackModel, messages);
  }
}

async function callModel(model: string, messages: ChatTurn[]): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${env.openRouterKey}`,
        "Content-Type": "application/json",
        "X-Title": "EL PACIENTE",
      },
      body: JSON.stringify({
        model,
        messages,
        // Respuestas cortas por diseño: esto es un directo, no un ensayo. El control real
        // es la instrucción del prompt; este techo es solo la red por si divaga.
        max_tokens: MAX_TOKENS,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`);
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string }; finish_reason?: string }[];
    };
    const choice = payload.choices?.[0];
    const text = choice?.message?.content?.trim();
    if (!text) throw new Error("Respuesta vacía del modelo");

    // Si el techo cortó la respuesta, la dejamos en la última frase completa: mejor que
    // EL PACIENTE termine antes de tiempo a que se le vea el corte a media palabra.
    return choice?.finish_reason === "length" ? trimToLastSentence(text) : text;
  } finally {
    clearTimeout(timer);
  }
}

function describe(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
