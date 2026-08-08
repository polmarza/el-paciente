/**
 * Recorta hasta el último cierre de frase. Se usa cuando el techo de tokens corta la
 * respuesta: mejor que EL PACIENTE termine antes de tiempo a que se le vea el corte a
 * media palabra. Devuelve el texto original si no encuentra ningún cierre, porque una
 * frase cortada sigue siendo preferible a dejarlo mudo.
 */
export function trimToLastSentence(text: string): string {
  const enders = new Set([".", "?", "!", "…"]);
  for (let i = text.length - 1; i >= 0; i--) {
    if (enders.has(text[i] as string)) {
      const trimmed = text.slice(0, i + 1).trim();
      return trimmed || text;
    }
  }
  return text;
}
