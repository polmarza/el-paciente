# El agente de EL PACIENTE, para correrlo 24/7 en Railway/Fly/Render.
# Solo el agente: la web se sirve desde Vercel y NO va en esta imagen.
#
# No expone ningún puerto a propósito — el agente solo abre conexiones salientes
# (WebSocket a Portal, HTTPS a OpenRouter). En la plataforma debe correr como
# worker/proceso de fondo, fijado a UNA réplica: dos agentes a la vez responden
# por duplicado (el cerrojo de instancia única es un PID local, no distribuido).
#
# Variables de entorno necesarias (se ponen en la plataforma, nunca aquí):
#   PORTAL_API_KEY, AGENT_SECRET, OPENROUTER_API_KEY,
#   OPENROUTER_MODEL, OPENROUTER_MODEL_FALLBACK

FROM node:22-slim

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

WORKDIR /app

# Primero solo los manifiestos, para que la capa de dependencias se cachee
# mientras no cambien.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/agent/package.json apps/agent/

RUN pnpm install --filter @el-paciente/agent... --frozen-lockfile --prod

COPY packages/shared/src packages/shared/src
COPY apps/agent/src apps/agent/src

WORKDIR /app/apps/agent

# Node 22 ejecuta el TS directamente (type stripping): sin paso de build.
CMD ["node", "--experimental-strip-types", "src/index.ts"]
