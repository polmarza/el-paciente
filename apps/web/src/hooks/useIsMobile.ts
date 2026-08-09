import { useSyncExternalStore } from "react";

/**
 * Umbral del modo móvil. Duplicado a la fuerza en la media query de `styles.css`
 * (`@media (max-width: 700px)`): CSS no puede leer constantes de JS. Si cambias uno,
 * cambia el otro.
 */
export const MOBILE_BREAKPOINT = 700;

const query = `(max-width: ${MOBILE_BREAKPOINT}px)`;

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(query).matches;
}

/**
 * ¿Estamos en el shell móvil? No es solo estética: en móvil la ESTRUCTURA cambia
 * (pestañas en vez de columnas, historial como panel propio, cabecera compacta),
 * y eso no se puede decidir solo con CSS.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot);
}
