/**
 * Tokens del diseño de EL PACIENTE (origen: Claude Design, "El Paciente.dc.html";
 * unificado tras el feedback de mentoría del 8/8).
 *
 * El contraste "dos mundos" vive en la VOZ, no en los paneles: todo el quirófano
 * comparte la gama fría y la monoespaciada, y la calidez (fondo y serifa) existe
 * únicamente en las burbujas de EL PACIENTE. Todos escriben con la tipografía de
 * la máquina; el único que habla con tipografía humana es la IA.
 * Cualquier color nuevo se añade aquí, nunca suelto en un componente.
 */
export const T = {
  // Superficies
  bg: "#07090b",
  monitorBg: "#0a0e11",
  monitorBorder: "#162026",
  chatBg: "#070b0e",
  chatDivider: "#1a2126",
  chatInputBg: "#0e1a1f",
  chatInputBorder: "#22333b",
  chatInputFocus: "#3d5a66",
  chatComposerBorder: "#101a20",
  brainBg: "#060a0d",
  brainRule: "#101a20",
  slotBg: "#0a1114",
  slotBgCooldown: "#070c0f",
  slotBorder: "#17232a",
  slotBorderCooldown: "#1b262c",
  slotBorderFlash: "#c98f2e",
  slotInputBg: "#0e1a1f",
  slotInputBorder: "#2a4048",

  // Texto
  textBright: "#dce8e6",
  textMono: "#7e949c",
  textDim: "#4f636b",
  textFaint: "#425059",
  slotLabel: "#54707a",
  slotContent: "#cfdedd",
  slotIdleStatus: "#46545c",
  humanText: "#c9d6d5",
  aiText: "#efe4d4",
  aiTextCrisis: "#f2ddd3",
  aiName: "#b09a7e",
  aiNameCrisis: "#e08c7d",
  logText: "#6e8189",
  logTime: "#3f4f57",
  logPrev: "#4a5860",
  typing: "#7a8a90",

  // Acentos
  vital: "#57d9a3",
  online: "#9be89b",
  alarm: "#e05c5c",
  amber: "#e0a43c",
  amberSoft: "#c79a4e",
  caret: "#e8d9c2",
} as const;

/**
 * Escala tipográfica. Había trece tamaños distintos repartidos por los componentes, que
 * es lo que hacía que la interfaz pareciera cosida de trozos. Seis pasos, y nada fuera
 * de aquí: si un texto necesita un tamaño nuevo, es que pertenece a un paso que ya existe.
 */
export const SIZE = {
  /** Etiquetas en versalitas, metadatos y marcas de tiempo. */
  micro: 11,
  /** Instrumental: cabecera, historial, avisos, botones. */
  small: 12.5,
  /** Lo que se lee y se escribe: mensajes, contenido de regiones, onboarding, inputs. */
  body: 14,
  /** Lo que debe destacar de un vistazo: el pulso, el nombre que eliges. */
  lead: 18,
  /** La voz de EL PACIENTE. */
  voice: 19,
  /** Titulares. */
  title: 30,
} as const;

/**
 * Dos familias, regla estricta: la serifa es SOLO para la voz de EL PACIENTE.
 * Todo lo demás — humanos incluidos — escribe con la monoespaciada del instrumental.
 */
export const FONT = {
  mono: "'IBM Plex Mono',monospace",
  serif: "'Lora',serif",
} as const;
