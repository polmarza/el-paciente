/** Lee y valida el entorno del agente. Falla pronto y con un motivo legible. */

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(
      `\n  Falta ${name}.\n  Rellena .env.local en la raíz del repo (ver .env.example).\n`,
    );
    process.exit(1);
  }
  return value;
}

export const env = {
  portalApiKey: required("PORTAL_API_KEY"),
  agentSecret: required("AGENT_SECRET"),
  openRouterKey: required("OPENROUTER_API_KEY"),
  model: process.env.OPENROUTER_MODEL?.trim() || "anthropic/claude-haiku-4.5",
  fallbackModel: process.env.OPENROUTER_MODEL_FALLBACK?.trim() || "google/gemini-2.5-flash",
} as const;
