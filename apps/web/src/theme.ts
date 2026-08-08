/**
 * Tokens del diseño de EL PACIENTE (Claude Design, "El Paciente.dc.html").
 * Dos mundos: el chat es cálido y humano; el cerebro es frío y clínico.
 * Cualquier color nuevo se añade aquí, nunca suelto en un componente.
 */
export const T = {
  // Superficies
  bg: "#07090b",
  monitorBg: "#0a0e11",
  monitorBorder: "#162026",
  chatBg: "linear-gradient(180deg,#141110 0%,#0f0c0b 100%)",
  chatDivider: "#1a2126",
  chatInputBg: "#1a1512",
  chatInputBorder: "#2a221c",
  chatInputFocus: "#4a3c2e",
  chatComposerBorder: "#201a16",
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
  humanText: "#ddd2c4",
  aiText: "#efe4d4",
  aiTextCrisis: "#f2ddd3",
  aiName: "#b09a7e",
  aiNameCrisis: "#e08c7d",
  logText: "#6e8189",
  logTime: "#3f4f57",
  logPrev: "#4a5860",
  typing: "#8a7d6c",

  // Acentos
  vital: "#57d9a3",
  online: "#9be89b",
  alarm: "#e05c5c",
  amber: "#e0a43c",
  amberSoft: "#c79a4e",
  caret: "#e8d9c2",
} as const;

export const FONT = {
  mono: "'IBM Plex Mono',monospace",
  serif: "'Lora',serif",
  sans: "'Instrument Sans',sans-serif",
} as const;
