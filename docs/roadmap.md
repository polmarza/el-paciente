# Roadmap

Fases de construcción para el hackathon. El criterio de corte de cada fase: ¿la demo se
puede enseñar si el hackathon terminara ahora? Cada fase deja algo demostrable.

---

## Fase 0 — Infraestructura ✅

- [x] Documentación completa en `docs/`
- [x] Repositorio público en GitHub
- [x] Monorepo pnpm (apps/web, apps/agent, packages/shared)
- [x] Prompt de diseño entregado a Claude Design y diseño recibido
- [ ] Cuenta Portal creada y claves en `.env.local` — **bloqueado, lo hace Pol**
- [ ] Clave de OpenRouter en `.env.local` — **bloqueado, lo hace Pol**

---

## Fase 1 — El cuerpo y el cerebro (código escrito, sin verificar en vivo) ✅

- [x] Chat con nicknames anónimos, color estable y renombrado
- [x] Presencia (aforo) y typing resuelto a nicknames vía metadata de presencia
- [x] Canal `brain` + reducer compartido (historial → 7 regiones), con tests
- [x] Mesa de operaciones con edición inline y los cuatro estados de región
- [x] Historial clínico con diff (valor tachado → valor nuevo)
- [x] Cursores colaborativos efímeros con caducidad
- [x] Constantes vitales (pulso derivado del ritmo de ediciones)
- [x] Cooldowns y anti-spoofing en `portal.config.ts`
- [x] Previsualización de UI sin Portal (`/preview.html`)

**Verificado:** compila, construye, 11 tests en verde y la interfaz renderizada coincide
con el diseño. **Sin verificar:** nada de esto ha hablado aún con Portal de verdad.

---

## Fase 2 — El despertar (código escrito, sin verificar en vivo) ✅

- [x] Agente Node: escucha `chat` y `brain`, coalescencia de ráfagas, turno único en vuelo
- [x] Cliente OpenRouter con modelo de respaldo y tiempo límite
- [x] System prompt: capa fija no editable + regiones + historial con autores
- [x] Reacción espontánea a ediciones, citando a quien te editó
- [x] Episodios de crisis (`[EPISODIO]`) con su tratamiento visual
- [x] Avisos clínicos en el chat cuando alguien interviene
- [x] Seed al arrancar en sala virgen + `--reset`

---

## Fase 3 — Primer contacto con Portal (siguiente)

Todo lo anterior está escrito contra los tipos reales del SDK, pero nunca se ha conectado.
Lo primero al tener credenciales:

- [ ] `npx @portalsdk/cli deploy` y `secrets set AGENT_SECRET`
- [ ] Dos navegadores: mensajes, presencia, typing
- [ ] Editar una región → destello, log, aviso clínico y reacción de la IA
- [ ] Violar un cooldown → toast con el motivo del middleware
- [ ] Intentar publicar `role: "ai"` desde la consola → bloqueado
- [ ] Matar y relanzar el agente → se reincorpora sin resembrar

---

## Fase 4 — El drama (polish para el jurado)

- [ ] Ajustar el ritmo: cooldowns y tono del prompt con gente real dentro
- [ ] Deploy a Vercel
- [ ] Ensayo del guion de demo con reset (checklist en `testing.md`)

---

## Descartado (con motivo)

| Funcionalidad | Motivo del descarte |
|---------------|---------------------|
| Base de datos propia | El historial de canales de Portal cubre todo lo que la demo necesita |
| Login / cuentas | Fricción letal para una demo de multitud; el anonimato alimenta la dinámica vándalo/cuidador |
| Multi-sala | Diluye la multitud; un único paciente concentra el drama |
| Votaciones para aprobar ediciones | Mata la inmediatez, que es el corazón del efecto |
