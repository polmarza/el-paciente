import { useEffect, useRef, useState } from "react";
import type { ChatEntry } from "./useChat";

/** Velocidad del tecleo de EL PACIENTE, tomada del diseño. */
const STEP_MS = 28;
const CHARS_PER_STEP = 2;

/**
 * La IA no transmite carácter a carácter por la red — sería carísimo y ruidoso.
 * El agente publica la frase entera y cada cliente la revela tecleando en local,
 * que es lo que el diseño muestra y lo que el público percibe como "está viva".
 *
 * Solo se anima lo que llega después de montar: el historial de backfill aparece
 * completo, sin teatro.
 */
export function useAiReveal(entries: readonly ChatEntry[]): {
  revealedId: string | null;
  revealedText: string;
} {
  const mountedAt = useRef(Date.now());
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [revealedText, setRevealedText] = useState("");
  const animatedIds = useRef(new Set<string>());

  const last = entries[entries.length - 1];
  const lastId = last?.id ?? null;

  useEffect(() => {
    if (!last || last.message.role !== "ai") return;
    if (last.at < mountedAt.current) return;
    if (animatedIds.current.has(last.id)) return;

    animatedIds.current.add(last.id);
    const full = last.message.body;
    setRevealedId(last.id);
    setRevealedText("");

    let shown = 0;
    const timer = setInterval(() => {
      shown = Math.min(full.length, shown + CHARS_PER_STEP);
      setRevealedText(full.slice(0, shown));
      if (shown >= full.length) {
        clearInterval(timer);
        setRevealedId(null);
      }
    }, STEP_MS);

    return () => clearInterval(timer);
    // Solo nos interesa reaccionar cuando cambia el último mensaje.
  }, [lastId, last]);

  return { revealedId, revealedText };
}
