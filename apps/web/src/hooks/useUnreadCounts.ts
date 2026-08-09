import { useEffect, useRef, useState } from "react";
import type { MobileTab } from "../components/MobileTabBar";

interface UnreadArgs {
  /** Solo tiene sentido en el shell móvil; apagado devuelve todo a cero. */
  enabled: boolean;
  active: MobileTab;
  /** Elementos visibles por pestaña. MENTE e HISTORIAL comparten fuente (el log del
   *  cerebro) pero cada una lleva su propio contador de vistos: sin casos especiales. */
  counts: Record<MobileTab, number>;
}

const ZERO: Record<MobileTab, number> = { pasillo: 0, chat: 0, mente: 0, historial: 0 };

/**
 * Cuántas novedades hay en cada pestaña desde la última vez que estuvo activa.
 *
 * `seen` guarda cuántos elementos había al salir de cada pestaña; el badge es la
 * diferencia. La activa siempre marca cero. Y un detalle que no es opcional: cuando el
 * relevo vacía los arrays (se filtran por `roundStartedAt`), los contadores bajan — si
 * `seen` se quedara con el valor viejo, el badge saldría negativo o inflado, así que se
 * fija al valor actual (clamp).
 */
export function useUnreadCounts({ enabled, active, counts }: UnreadArgs): Record<MobileTab, number> {
  const [, force] = useState(0);
  const seen = useRef<Record<MobileTab, number> | null>(null);

  // El histórico que ya estaba al llegar no es "no leído": el primer valor de cada
  // contador se da por visto.
  if (seen.current === null) seen.current = { ...counts };

  useEffect(() => {
    const record = seen.current!;
    let changed = false;

    for (const tab of Object.keys(counts) as MobileTab[]) {
      // Purga de ronda: el canal encogió, lo visto no puede superar lo que hay.
      if (counts[tab] < record[tab]) {
        record[tab] = counts[tab];
        changed = true;
      }
    }

    // La pestaña activa consume sus novedades en el acto.
    if (record[active] !== counts[active]) {
      record[active] = counts[active];
      changed = true;
    }

    // Sin el shell móvil no hay pestañas: todo visto, siempre.
    if (!enabled) {
      for (const tab of Object.keys(counts) as MobileTab[]) {
        if (record[tab] !== counts[tab]) {
          record[tab] = counts[tab];
          changed = true;
        }
      }
    }

    if (changed) force((n) => n + 1);
  }, [enabled, active, counts]);

  if (!enabled) return ZERO;
  const record = seen.current;
  return {
    pasillo: active === "pasillo" ? 0 : Math.max(0, counts.pasillo - record.pasillo),
    chat: active === "chat" ? 0 : Math.max(0, counts.chat - record.chat),
    mente: active === "mente" ? 0 : Math.max(0, counts.mente - record.mente),
    historial: active === "historial" ? 0 : Math.max(0, counts.historial - record.historial),
  };
}
