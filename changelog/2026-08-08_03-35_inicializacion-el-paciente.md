# Inicialización del proyecto EL PACIENTE

**Fecha:** 2026-08-08 03:35
**Tipo:** Configuración

## Qué se hizo

Se convirtió la plantilla en el repositorio real de **EL PACIENTE** (proyecto de hackathon:
una IA que chatea en público mientras la audiencia edita su memoria e identidad en vivo).

- Se rellenaron los 8 documentos de `docs/` con producto, negocio, dirección visual,
  arquitectura (Portal + OpenRouter + agente Node), modelo de datos (canales de Portal,
  sin base de datos), roadmap por fases de hackathon, flujos de usuario y estrategia de testing.
- Se investigó la documentación oficial de Portal (docs.useportal.co) para fundamentar la
  arquitectura: canales con historial, presencia, mensajes ephemeral (cursores) y middleware
  server-side en `portal.config.ts` (cooldowns y anti-spoofing).
- Se reescribió `README.md` para el producto y `CLAUDE.md` sin placeholders ni sección de
  inicialización.
- `LICENSE` con año y autor reales (2026, Pol Marzà).
- `.env.example` reducido a las variables reales del stack (Portal, OpenRouter, AGENT_SECRET).
- `mejoras/backlog.md` limpio y `changelog/` sin restos de la plantilla.
- Eliminados `.template/` y `.claude/commands/init-proyecto.md`.

## Qué se modificó

- `docs/*.md` (los 8)
- `README.md`, `CLAUDE.md`, `LICENSE`, `.env.example`
- `changelog/README.md`, `mejoras/backlog.md`
- Borrados: `.template/`, `.claude/commands/init-proyecto.md`

## Por qué

Arranque del proyecto para el hackathon. La documentación queda como fuente de verdad antes
de escribir código, y el repo deja de describirse como plantilla.
