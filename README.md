# project-template

Plantilla para empezar proyectos cuando trabajas con agentes de código (Claude Code, Cursor y compañía) sin que se pongan a escribir antes de entender qué estás construyendo.

---

## ¿Qué es esto?

Una plantilla de repositorio que impone un protocolo simple: **antes de tocar código, el agente lee la documentación del proyecto**.

Si los documentos están vacíos, empieza haciendo preguntas — no escribiendo código. Si están rellenos, arranca con todo el contexto cargado y sin tener que volver a explicárselo en cada sesión.

Es agnóstica al stack. El protocolo funciona igual con Next.js, Astro, FastAPI o cualquier otra cosa que decidas usar.

---

## ¿Para quién es?

- Founders y equipos pequeños que construyen productos con ayuda de agentes de IA y quieren reducir el rework.
- Cualquiera que se haya cansado de explicarle al modelo el mismo contexto en cada conversación nueva.

---

## ¿Qué hay dentro?

- **`CLAUDE.md`** — Contrato de entrada para el agente. Define qué leer, cómo registrar cambios, qué no hacer y cuándo ejecutar revisiones de seguridad.
- **`docs/`** — Ocho archivos vivos que capturan las decisiones que típicamente se pierden entre conversaciones: producto, arquitectura, modelo de datos, design system, business, roadmap, flujos de usuario y testing.
- **`changelog/`** — Registro estructurado de cada cambio importante: qué, cuándo y por qué.
- **`mejoras/`** — Backlog de ideas que no entran en el sprint actual pero no se quieren perder.
- **`.claude/`** — Configuración de Claude Code con permisos sensatos y slash commands custom para no tener que recordar el protocolo de memoria.
- **`.github/`** — Plantillas de pull request e issues alineadas con el protocolo.
- Lo aburrido pero necesario: `.gitignore`, `.env.example`, `LICENSE`.

---

## ¿Cómo funciona el protocolo?

1. **Cualquier sesión empieza leyendo `docs/`.** Si están vacíos o incompletos, el agente pregunta antes de actuar.
2. **Cada cambio importante deja registro en `changelog/`** con qué se hizo, qué se modificó y por qué.
3. **Si el cambio afecta a algo documentado, se actualiza el doc en la misma sesión.** No hay documentación desincronizada.
4. **Antes de mergear a producción**, se ejecuta `/security-review` para detectar vulnerabilidades, credenciales filtradas y problemas comunes.
5. **Las ideas que no entran ahora se anotan en `mejoras/`** sin interrumpir el flujo actual.

---

## ¿Cómo empezar?

1. Usa este repo como plantilla en GitHub (botón **"Use this template"**) o clónalo directamente.
2. Abre el proyecto en Claude Code, Cursor o el agente que prefieras.
3. Cuando el agente lea `CLAUDE.md` por primera vez, te preguntará qué quieres construir y para quién. Responde y deja que vaya completando los docs contigo, uno a uno.
4. Cuando todos los docs estén rellenos, arranca el desarrollo. A partir de ahí, cada sesión nueva entra ya con todo el contexto cargado.

---

## Convenciones

- Gestor de paquetes: **pnpm v11** (no npm, no yarn).
- El resto de convenciones (idioma, naming, estilo) se decide al rellenar `CLAUDE.md` y `docs/architecture.md`.

---

## Adaptar para tu proyecto

Cuando uses esta plantilla en un proyecto real, **reemplaza este README.md por uno específico para ese proyecto**. Estructura sugerida:

- Nombre y descripción de una línea
- Qué es el proyecto y qué problema resuelve
- Requisitos previos (Node, base de datos, cuentas necesarias)
- Variables de entorno (referencia `.env.example`)
- Instalación y desarrollo (`pnpm install`, `pnpm dev`)
- Estructura de carpetas
- Cómo contribuir (referencia a `CLAUDE.md` y al protocolo)
- Estado del proyecto

---

## Licencia

MIT. Ver [`LICENSE`](./LICENSE).
