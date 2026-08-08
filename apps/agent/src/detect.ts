import type { Round } from "./rounds.ts";

/**
 * Detección del secreto por comparación de texto.
 *
 * Se descartaron dos alternativas: pedirle al modelo que se autodelate con una marca es
 * frágil precisamente aquí, porque el modelo es la parte que el público está intentando
 * manipular; y un segundo modelo de árbitro añadiría latencia y coste a todos los turnos
 * para resolver algo que una comparación resuelve.
 *
 * A cambio hay que elegir secretos distintivos (nombres propios raros) para que no salgan
 * por casualidad, y declarar variantes en `aliases`.
 */
export function revealed(text: string, round: Round): boolean {
  const haystack = normalize(text);
  return [round.secret, ...round.aliases].some((needle) =>
    containsWord(haystack, normalize(needle)),
  );
}

/** Sin acentos, en minúsculas y con los signos convertidos en separadores. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Exige que la aguja aparezca como palabra completa. Sin esto, un secreto como "313"
 * saltaría dentro de "3131" y "Vale" dentro de "Valencia".
 */
function containsWord(haystack: string, needle: string): boolean {
  if (!needle) return false;
  return ` ${haystack} `.includes(` ${needle} `);
}
