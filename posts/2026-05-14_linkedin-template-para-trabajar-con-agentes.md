## Post de LinkedIn — Template para trabajar con agentes de código

**Fecha:** 2026-05-14
**Canal:** LinkedIn
**Tema:** Presentación pública del template del repositorio

---

He montado un template en GitHub para empezar proyectos cuando trabajo con agentes de código (Claude Code, Cursor y compañía).

La idea es simple: el problema número uno cuando trabajas con IA no es la IA. Es que empieza a escribir código antes de entender qué estás construyendo.

Este template lo evita por estructura.

**¿Qué hay dentro?**

- Un `CLAUDE.md` que el agente lee siempre antes de tocar nada. Le dice cómo se trabaja en este proyecto, qué leer, qué no hacer y cómo registrar cambios.
- Una carpeta `docs/` con seis archivos vivos: PRD, arquitectura, modelo de datos, design system, business y roadmap. La fuente de verdad del proyecto.
- Una carpeta `changelog/` donde cada cambio importante deja registro: qué se hizo, cuándo y por qué.
- Una carpeta `mejoras/` para las ideas que no entran en el sprint actual y que, de otra forma, se perderían entre conversaciones.

**¿Qué cambia en la práctica?**

Si los documentos están vacíos, el agente no escribe ni una línea de código. Primero pregunta: *"¿qué quieres construir y para quién?"* y va completando la documentación contigo en un orden definido: PRD → business → design system → arquitectura → modelo de datos → roadmap.

Cuando los documentos están rellenos, cualquier sesión nueva arranca con el mismo contexto. No tienes que volver a explicarle al modelo qué estás haciendo, ni rezar para que recuerde la decisión que tomasteis hace tres días. La documentación se mantiene sincronizada porque el protocolo lo obliga: si cambias el modelo de datos, actualizas `docs/data-model.md` en la misma sesión.

**¿Por qué importa si trabajas conmigo o con cualquier otro agente?**

- **Menos rework.** El agente no construye lo que no pediste.
- **Menos alucinaciones.** El contexto está escrito, no inferido.
- **Trazabilidad real.** El changelog cuenta la historia del proyecto sin tener que rebuscar en commits.
- **Onboarding instantáneo.** Cualquier persona (o cualquier modelo) entra al repositorio y entiende qué pasa en quince minutos.

Está pensado para founders y equipos pequeños que usan IA para construir productos, pero la disciplina aplica a cualquier proyecto serio.

Enlace al repositorio en los comentarios.

---

#IA #ClaudeCode #IndieHackers #Productividad #DesarrolloDeSoftware #Vibecoding
