# Roadmap

Fases de construcción para el hackathon. El criterio de corte de cada fase: ¿la demo se
puede enseñar si el hackathon terminara ahora? Cada fase deja algo demostrable.

---

## Fase 0 — Infraestructura ✅ (en curso)

- [x] Documentación completa en `docs/`
- [ ] Monorepo pnpm (apps/web, apps/agent, packages/shared)
- [ ] Cuenta Portal, `portal.config.ts` inicial desplegado, claves en `.env.local`
- [ ] Clave OpenRouter en el entorno del agente
- [ ] Prompt de diseño entregado a Claude Design (en paralelo, Pol)

**Demostrable:** dos navegadores conectados al canal `chat` viéndose mensajes.

---

## Fase 1 — El cuerpo (chat en vivo)

- [ ] Chat con nicknames anónimos + color estable
- [ ] Presencia (contador de gente dentro) y typing
- [ ] Historial al conectar (`history`)
- [ ] Cooldown de chat (3 s) en middleware

**Demostrable:** sala de chat pública multi-usuario fluida.

---

## Fase 2 — El cerebro abierto

- [ ] Canal `brain` + reducer compartido (historial → 7 slots)
- [ ] Panel de slots con edición inline y estados (reposo/editando/recién editado/cooldown)
- [ ] Log de ediciones visible (quién, qué, diff, cuándo)
- [ ] Cooldowns por slot y por usuario en `portal.config.ts`
- [ ] Cursores colaborativos (ephemeral)

**Demostrable:** el momento r/place — multitud editando una mente con cursores en vivo
(la IA aún no habla).

---

## Fase 3 — El despertar (la IA entra)

- [ ] Agente Node: suscripción a `chat` + `brain`, cola de turnos, publicación firmada
- [ ] Cliente OpenRouter con streaming y modelo por env
- [ ] Construcción del system prompt: capa fija no editable + snapshot de slots + log reciente
- [ ] Reacción a mensajes del chat
- [ ] Reacción espontánea a ediciones del cerebro (con cita del autor por nickname)
- [ ] Anti-spoofing (patrón secret + mask) verificado
- [ ] Seed del cerebro al arrancar + comando reset

**Demostrable:** LA demo completa — editas el miedo y EL PACIENTE reacciona en segundos.

---

## Fase 4 — El drama (polish para el jurado)

- [ ] Aplicar el diseño de Claude Design (tokens → `design-system.md` → Tailwind)
- [ ] Estados de ánimo visibles (`mood`) y momento "crisis de identidad"
- [ ] Mensajes de sistema en el chat cuando editan el cerebro
- [ ] Constantes vitales (COULD — solo si sobra tiempo)
- [ ] Deploy a Vercel + ensayo del guion de demo con reset

**Demostrable:** demo de 3 minutos ensayada para pantalla grande.

---

## Descartado (con motivo)

| Funcionalidad | Motivo del descarte |
|---------------|---------------------|
| Base de datos propia | El historial de canales de Portal cubre todo lo que la demo necesita |
| Login / cuentas | Fricción letal para una demo de multitud; el anonimato alimenta la dinámica vándalo/cuidador |
| Multi-sala | Diluye la multitud; un único paciente concentra el drama |
| Votaciones para aprobar ediciones | Mata la inmediatez, que es el corazón del efecto |
