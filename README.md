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

- **`CLAUDE.md`** — Contrato de entrada para el agente. Define qué leer, cómo registrar cambios, cómo configurar los MCPs del stack, qué no hacer y cuándo ejecutar revisiones de seguridad.
- **`docs/`** — Ocho archivos vivos que capturan las decisiones que típicamente se pierden entre conversaciones: producto, arquitectura, modelo de datos, design system, business, roadmap, flujos de usuario y testing.
- **`changelog/`** — Registro estructurado de cada cambio importante: qué, cuándo y por qué. **Llega vacío**: solo con el archivo que explica el formato.
- **`mejoras/`** — Backlog de ideas que no entran en el sprint actual pero no se quieren perder.
- **`.claude/`** — Configuración de Claude Code con permisos sensatos y slash commands custom para no tener que recordar el protocolo de memoria.
- **`.github/`** — Plantillas de pull request e issues alineadas con el protocolo.
- **`.template/`** — Historial de la plantilla en sí. Se borra al inicializar tu proyecto, así no arrastras cambios que no son tuyos.
- Lo aburrido pero necesario: `.gitignore`, `.env.example`, `LICENSE`.

---

## ¿Cómo funciona el protocolo?

1. **Cualquier sesión empieza leyendo `docs/`.** Si están vacíos o incompletos, el agente pregunta antes de actuar.
2. **Cada cambio importante deja registro en `changelog/`** con qué se hizo, qué se modificó y por qué.
3. **Si el cambio afecta a algo documentado, se actualiza el doc en la misma sesión.** No hay documentación desincronizada.
4. **Con el stack ya decidido, el agente pregunta qué MCPs quieres** y con qué alcance: los globales que ya tengas, o servidores configurados a nivel de proyecto en `.mcp.json`. No instala nada por su cuenta ni antes de que haya stack.
5. **Antes de mergear a producción**, se ejecuta `/security-review` para detectar vulnerabilidades, credenciales filtradas y problemas comunes.
6. **Las ideas que no entran ahora se anotan en `mejoras/`** sin interrumpir el flujo actual.

---

## ¿Cómo empezar?

1. Usa este repo como plantilla en GitHub (botón **"Use this template"**) o clónalo directamente.
2. Abre el proyecto en Claude Code, Cursor o el agente que prefieras.
3. Cuando el agente lea `CLAUDE.md` por primera vez, te preguntará qué quieres construir y para quién. Responde y deja que vaya completando los docs contigo, uno a uno.
4. Con los docs rellenos, el agente **inicializa el proyecto**: reescribe este README para tu producto, rellena los datos de `CLAUDE.md`, ajusta la licencia y `.env.example`, borra `.template/` y deja el changelog con su primera entrada real. Lo hace solo; si quieres forzarlo, usa `/init-proyecto`.
5. A partir de ahí, arranca el desarrollo. Cada sesión nueva entra ya con todo el contexto cargado.

---

## Convenciones

- Gestor de paquetes: **pnpm v11** (no npm, no yarn).
- El resto de convenciones (idioma, naming, estilo) se decide al rellenar `CLAUDE.md` y `docs/architecture.md`.

---

## Adaptar para tu proyecto

No tienes que hacerlo a mano: el agente lo hace en la inicialización, siguiendo el checklist de la sección "Inicialización del proyecto" de `CLAUDE.md`. Lo que cambia:

| Archivo | Qué pasa con él |
|---------|-----------------|
| `README.md` | Se reescribe entero para tu producto (este texto desaparece) |
| `CLAUDE.md` | Se rellenan nombre, stack, estructura y convenciones |
| `LICENSE` | Se sustituyen `[YEAR]` y `[AUTHOR]` |
| `.env.example` | Se queda solo con las variables de tu stack |
| `changelog/` | Recibe la primera entrada real del proyecto |
| `mejoras/backlog.md` | Se limpia el ejemplo |
| `.template/` | Se borra |

El criterio es simple: cuando termina la inicialización, **ningún archivo del repo se describe a sí mismo como plantilla**. Todo habla de tu proyecto.

---

## Licencia

MIT. Ver [`LICENSE`](./LICENSE).
