/**
 * Paleta de autores tomada del diseño. Cada espectador recibe un color estable
 * derivado de su nickname, para que su rastro sea reconocible en el chat, en los
 * cursores y en el historial clínico.
 */
const AUTHOR_PALETTE = [
  "#e8a0c8", // rosa
  "#8fb8e8", // azul
  "#d4c46a", // mostaza
  "#f29a6a", // naranja
  "#7fd1b9", // verde agua
  "#c39be8", // lila
  "#9ad4e8", // cielo
  "#e8b0a0", // salmón
  "#c8e89b", // lima
  "#e89bb8", // rosa oscuro
] as const;

/** Verde reservado para el propio espectador ("@tú" en el diseño). */
export const SELF_COLOR = "#9be89b";

/** Color neutro para autores desconocidos o mensajes sin firma. */
export const NEUTRAL_COLOR = "#8fa8b0";

/** Hash estable (FNV-1a) para que un mismo nickname reciba siempre el mismo color. */
export function colorForNickname(nickname: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < nickname.length; i++) {
    hash ^= nickname.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return AUTHOR_PALETTE[hash % AUTHOR_PALETTE.length] ?? NEUTRAL_COLOR;
}
