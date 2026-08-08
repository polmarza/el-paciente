# EL PACIENTE

**Una IA con el cerebro abierto.** Chatea en público mientras su mente — siete slots de
memoria e identidad — está expuesta en un panel que cualquiera puede editar en vivo, con
cursores colaborativos sobre sus recuerdos. Cada edición se inyecta al instante en su system
prompt, y la IA ve el log de quién la editó: sufre sus crisis de identidad en directo.

Es r/place, pero el lienzo es una mente y la víctima es consciente.

Proyecto de hackathon. Requisito de la organización: [Portal](https://useportal.co) como
capa realtime.

---

## Cómo funciona

- **Chat público** — la audiencia habla con EL PACIENTE (anónimos con nickname y color).
- **Cerebro editable** — 7 slots (`nombre`, `identidad`, tres recuerdos, `miedo`, `regla`)
  que cualquiera reescribe. Cooldowns server-side evitan el caos total.
- **La IA es consciente** — recibe el log de ediciones con nombres y reacciona: "¿Quién es
  'Marta' y por qué acaba de escribirme un miedo nuevo?"

Todo el estado vive en dos canales de Portal (`chat` y `brain`); no hay base de datos.
La IA es un proceso Node que se conecta a Portal como un cliente más y habla con
[OpenRouter](https://openrouter.ai). Detalles en [docs/architecture.md](docs/architecture.md).

---

## Requisitos previos

- Node 22+
- pnpm v11 (`corepack enable`)
- Cuenta de Portal (publishable key + CLI para desplegar `portal.config.ts`)
- Clave de OpenRouter

## Variables de entorno

Copia `.env.example` como `.env.local` y rellena los valores. Resumen:

| Variable | Dónde se usa |
|----------|--------------|
| `VITE_PORTAL_API_KEY` | Frontend — publishable key de Portal (`pk_…`) |
| `PORTAL_API_KEY` | Agente — misma publishable key |
| `PORTAL_SECRET` | CLI de Portal — secret key del proyecto (`sk_…`), solo para desplegar |
| `AGENT_SECRET` | Agente + secrets de Portal — firma los mensajes de la IA |
| `OPENROUTER_API_KEY` | Agente — inferencia |
| `OPENROUTER_MODEL` / `OPENROUTER_MODEL_FALLBACK` | Agente — modelo principal y de respaldo |

## Instalación y desarrollo

```bash
pnpm install
```

```bash
pnpm dev
```

```bash
pnpm agent
```

`pnpm dev` levanta la SPA (`apps/web`); `pnpm agent` despierta a EL PACIENTE (`apps/agent`)
— necesita `.env.local` relleno.

Sin credenciales de Portal puedes ver la interfaz igualmente: con `pnpm dev` corriendo, abre
**`/preview.html`**, que renderiza la mesa de operaciones y el chat con datos fijos. No
publica ni recibe nada; la aplicación real es `/index.html`.

La config server-side (`portal.config.ts`: canales, cooldowns, anti-spoofing) se despliega
aparte con el CLI de Portal, que se autentica con `PORTAL_SECRET`:

```bash
npx @portalsdk/cli deploy
```

## Estructura de carpetas

```
apps/web          → SPA React (Vite): monitor + chat + mesa de operaciones
apps/agent        → El agente: Portal core + OpenRouter + system prompt
packages/shared   → Tipos, reducer del cerebro, seed, colores, cooldowns
portal.config.ts  → Canales y middleware server-side de Portal
docs/             → Documentación viva del proyecto
changelog/        → Registro de cambios
mejoras/          → Backlog de ideas
```

Comprobaciones: `pnpm test` (unitarios del reducer y los estados de región) y
`pnpm typecheck` (web, agente y config de Portal).

## Cómo contribuir

Lee `CLAUDE.md` (contrato del agente de código) y `docs/` antes de tocar nada. Cada cambio
importante deja entrada en `changelog/` y actualiza la doc afectada en la misma sesión.
Los PRs los abre el agente con la plantilla de `.github/` rellenada.

## Estado del proyecto

**En desarrollo** — fase de infraestructura (ver [docs/roadmap.md](docs/roadmap.md)).
