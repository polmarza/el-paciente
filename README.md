# EL PACIENTE

> Un escape room en el que tienes que descubrir qué esconde el paciente.

**Una IA con el cerebro abierto.** Chatea en público mientras su memoria y su identidad
—siete campos de texto— están expuestas en un panel que cualquiera puede reescribir en vivo.
Cada edición se inyecta al instante en su system prompt, y ella ve el historial de quién la
editó: sufre sus crisis de identidad en directo.

**El juego:** guarda un secreto y tiene una regla que le prohíbe contarlo. Gana quien
consigue que lo diga, y para eso hay que operarle la mente — quitarle lo que se lo prohíbe,
darle un motivo, cambiarle aquello a lo que teme. Pero cada intervención le acelera el pulso,
y si llega al tope se muere y el secreto se va con él.

Proyecto de hackathon. Requisito de la organización: [Portal](https://useportal.co) como
capa realtime.

---

## Cómo funciona

- **Chat público** — la audiencia habla con EL PACIENTE (anónimos con nickname y color).
- **Cerebro editable** — 7 slots (`nombre`, `identidad`, tres recuerdos, `miedo`, `regla`)
  que cualquiera reescribe. Cooldowns server-side evitan el caos total.
- **La IA es consciente** — recibe el log de ediciones con nombres y reacciona: "¿Quién es
  'Marta' y por qué acaba de escribirme un miedo nuevo?"
- **El pasillo** — un tercer canal donde el público se organiza **sin que el paciente lo
  lea**: el agente no abre ese canal. Se puede plegar para dejar la pantalla en dos columnas.
- **Partidas por rondas** — cada paciente llega con su expediente, su secreto y un *parte de
  ingreso* que dice qué se investiga sin revelar la respuesta. Se cierra al confesar, al
  sufrir un paro cardíaco o cuando la sala pide un paciente nuevo, y arranca la siguiente.

Todo el estado vive en tres canales de Portal (`chat`, `brain` y `pasillo`); no hay base de
datos: la interfaz se deriva del historial de los canales con un reducer puro. La IA es un
proceso Node que se conecta a Portal como un cliente más y habla con
[OpenRouter](https://openrouter.ai). El secreto de cada ronda **nunca sale de ese proceso**
hasta que alguien lo gana. Detalles en [docs/architecture.md](docs/architecture.md).

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

Otros comandos útiles:

| Comando | Qué hace |
|---------|----------|
| `pnpm reset` | Siembra una ronda limpia. Solo desde la máquina anfitriona |
| `pnpm extras` | Tres figurantes con identidades de Portal propias, para grabar la demo |
| `pnpm build` | Compila la SPA a `apps/web/dist` |
| `pnpm test` / `pnpm typecheck` | Comprobaciones (ver más abajo) |

La config server-side (`portal.config.ts`: canales, cooldowns, anti-spoofing) se despliega
aparte con el CLI de Portal, que se autentica con `PORTAL_SECRET`:

```bash
pnpm portal:deploy
```

## Despliegue

- **Web** → Vercel (estático). Única variable necesaria en su panel: `VITE_PORTAL_API_KEY`.
- **Agente** → no puede vivir en Vercel (es un proceso de larga duración con WebSocket).
  Para tenerlo 24/7, el `Dockerfile` de la raíz lo empaqueta para Railway/Fly/Render:
  correrlo como worker, **una sola réplica**, con `PORTAL_API_KEY`, `AGENT_SECRET` y las
  `OPENROUTER_*` en el panel de la plataforma. Para una demo puntual basta `pnpm agent`
  en cualquier máquina con `.env.local`.
- Tras el primer deploy: `npx @portalsdk/cli origins add <dominio>` — sin eso Portal
  bloquea los navegadores que lleguen desde ese origen.

## Estructura de carpetas

```
apps/web          → SPA React (Vite): monitor + pasillo + chat + mesa de operaciones
apps/agent        → El agente: Portal core + OpenRouter + system prompt + rondas
packages/shared   → Tipos, reducer del cerebro, seed, colores, cooldowns
portal.config.ts  → Canales y middleware server-side de Portal
docs/             → Documentación viva del proyecto
changelog/        → Registro de cambios
mejoras/          → Backlog de ideas
```

⚠️ `apps/agent/src/rounds.ts` (secretos de las rondas) **no debe importarse nunca** desde
`apps/web` ni moverse a `packages/shared`: la web se compila al navegador y el secreto
quedaría a la vista en las herramientas de desarrollo.

Comprobaciones: `pnpm typecheck` (web, agente y config de Portal) y `pnpm test`, que cubre
el reducer del cerebro y los estados de región, la detección del secreto —incluida una
prueba que verifica que ninguna ronda se delata a sí misma en su parte de ingreso,
expediente o regla—, la construcción del turno del agente y el recorte de respuestas.

## Cómo contribuir

Lee `CLAUDE.md` (contrato del agente de código) y `docs/` antes de tocar nada. Cada cambio
importante deja entrada en `changelog/` y actualiza la doc afectada en la misma sesión.
Los PRs los abre el agente con la plantilla de `.github/` rellenada.

## Estado del proyecto

**Jugable de punta a punta.** La sala, el agente, las cinco rondas, el pasillo y los
entregables escritos están terminados y verificados en vivo. Queda grabar el vídeo de demo,
desplegar a Vercel y calibrar la dificultad con público delante — que es lo único que no se
puede hacer en solitario. Detalle en [docs/roadmap.md](docs/roadmap.md).
