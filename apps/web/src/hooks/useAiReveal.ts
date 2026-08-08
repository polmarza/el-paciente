import { useEffect, useRef, useState } from "react";
import type { ChatEntry } from "./useChat";

/** Velocidad del tecleo de EL PACIENTE, tomada del diseño. */
const STEP_MS = 28;
const CHARS_PER_STEP = 2;
/**
 * Techo de duración del tecleo. Una respuesta corta mantiene exactamente el ritmo del
 * diseño; una larga acelera en vez de arrastrarse, porque en un directo nadie espera seis
 * segundos a que termine una frase.
 */
const MAX_REVEAL_MS = 2800;

/** Cuántos caracteres revelar por paso para no pasarse del techo de duración. */
function charsPerStep(length: number): number {
  const steps = MAX_REVEAL_MS / STEP_MS;
  return Math.max(CHARS_PER_STEP, Math.ceil(length / steps));
}

/**
 * La IA no transmite carácter a carácter por la red — sería carísimo y ruidoso.
 * El agente publica la frase entera y cada cliente la revela tecleando en local,
 * que es lo que el diseño muestra y lo que el público percibe como "está viva".
 *
 * Solo se anima lo que llega después de montar: el historial de backfill aparece
 * completo, sin teatro.
 *
 * El efecto depende ÚNICAMENTE del id del mensaje, nunca del objeto. Cualquier
 * actualización del canal (presencia, actividad, otro que teclea) recrea ese objeto, y
 * si estuviera en las dependencias el efecto se relanzaría, limpiaría el temporizador y
 * la guarda impediría rearrancarlo: el mensaje se quedaba congelado a medio escribir
 * para siempre.
 */
export function useAiReveal(entries: readonly ChatEntry[]): {
  revealedId: string | null;
  revealedText: string;
} {
  const mountedAt = useRef(Date.now());
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [revealedText, setRevealedText] = useState("");

  const last = entries[entries.length - 1];
  const lastId = last?.id ?? null;

  // El efecto lee el mensaje de aquí en vez de recibirlo por dependencias.
  const lastRef = useRef(last);
  lastRef.current = last;

  useEffect(() => {
    const message = lastRef.current;
    if (!message || message.message.role !== "ai") return;
    if (message.at < mountedAt.current) return;

    const full = message.message.body;
    setRevealedId(message.id);
    setRevealedText("");

    const step = charsPerStep(full.length);
    const startedAt = Date.now();

    // Se revela según el RELOJ, no según cuántas veces haya corrido el temporizador.
    // El navegador estrangula los `setInterval` de las pestañas en segundo plano, así que
    // contar pulsos hacía que el mensaje se quedara a medias mientras mirabas otra ventana
    // y siguiera a rastras al volver. Con el reloj, cada pulso pone el texto donde debería
    // estar y al volver aparece ya completo.
    const tick = () => {
      const shown = Math.min(full.length, Math.ceil((Date.now() - startedAt) / STEP_MS) * step);
      setRevealedText(full.slice(0, shown));
      if (shown >= full.length) {
        clearInterval(timer);
        document.removeEventListener("visibilitychange", tick);
        setRevealedId(null);
      }
    };

    const timer = setInterval(tick, STEP_MS);
    // Al volver a la pestaña, ponernos al día sin esperar al siguiente pulso.
    document.addEventListener("visibilitychange", tick);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
      // Si el turno se interrumpe (llega otro mensaje), el anterior se muestra entero:
      // nunca dejamos una frase a medias en pantalla.
      setRevealedId((current) => (current === message.id ? null : current));
    };
  }, [lastId]);

  return { revealedId, revealedText };
}
