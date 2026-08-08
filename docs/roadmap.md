# Roadmap

Fases de construcción para el hackathon. El criterio de corte de cada fase: ¿la demo se
puede enseñar si el hackathon terminara ahora? Cada fase deja algo demostrable.

---

## Fase 0 — Infraestructura ✅

- [x] Documentación completa en `docs/`
- [x] Repositorio público en GitHub
- [x] Monorepo pnpm (apps/web, apps/agent, packages/shared)
- [x] Diseño recibido de Claude Design e implementado
- [x] Proyecto de Portal creado, claves en `.env.local`, `portal.config.ts` desplegado
- [x] Clave de OpenRouter y agente en marcha

---

## Fase 1 — La sala ✅

- [x] Chat con nicknames anónimos, color estable y renombrado
- [x] Presencia (aforo) y typing resuelto a nicknames vía metadata de presencia
- [x] Canal `brain` + reducer compartido, con tests
- [x] Mesa de operaciones con edición inline y los cuatro estados de región
- [x] Historial clínico con diff (valor tachado → valor nuevo)
- [x] Cursores colaborativos efímeros con caducidad
- [x] Constantes vitales (pulso derivado del ritmo de ediciones)
- [x] Cooldowns y anti-suplantación en `portal.config.ts`, verificados en vivo (9/9)
- [x] Previsualización de UI sin Portal (`/preview.html`)
- [x] El chat sigue el texto sin secuestrar el scroll: si subes a leer, no te arrastra
- [x] Tecleo en vivo regido por el reloj, no por pulsos del temporizador — no se rompe al
      cambiar de ventana, y tiene techo de duración para que una respuesta larga no se
      arrastre

---

## Fase 2 — El paciente ✅

- [x] Agente con coalescencia de ráfagas y turno único en vuelo
- [x] Cliente de OpenRouter con modelo de respaldo y tiempo límite
- [x] System prompt: capa fija + regiones + historial con autores
- [x] Reacción espontánea a ediciones, citando a quien te editó
- [x] Episodios de crisis con su tratamiento visual
- [x] Respuestas breves por diseño (de ~700 a ~110 caracteres; el turno bajó de 13 s a 4 s)
- [x] Corte limpio por frase completa si el techo de tokens llega a actuar
- [x] Cerrojo de instancia única (dos agentes respondían por duplicado, en silencio)
- [x] Indicador de "pensando" emitido por el agente, no deducido por la web

---

## Fase 3 — El juego ✅

- [x] Cinco rondas con secreto, grieta psicológica y regla visible
- [x] Detección del secreto por comparación de texto, con tests
- [x] Fin de ronda: marcador persistente, secreto revelado, autor y duración
- [x] Paro cardíaco como segundo desenlace
- [x] Reinicio automático con la ronda siguiente
- [x] Parte médico descargable en PNG para compartir
- [x] Relevo limpio: expediente nuevo, chat, historial y memoria del agente por ronda
- [x] Sala bloqueada durante el relevo
- [x] El secreto no viaja por Portal hasta que se gana (verificado sobre el bundle)

---

## Fase 4 — La multitud ✅

- [x] Modal de entrada con instrucciones por pasos y elección de nombre
- [x] Canal `pasillo`: tercera columna para que el público delibere **sin que el paciente
      lo lea** (el agente no abre ese canal)
- [x] Botón de ayuda para reabrir las instrucciones

---

## Fase 5 — Los entregables ✅ (falta grabar)

- [x] Pitch de ≤ 280 caracteres, en tres versiones (`docs/entregables.md`)
- [x] Descripción del repositorio en GitHub, ya con el objetivo del juego
- [x] README que explica la premisa **y** a qué se juega
- [x] Explicación de cómo se usó Portal
- [x] Escaleta del vídeo con tiempos, plano a plano
- [x] `pnpm extras`: tres figurantes con identidades de Portal independientes que pueblan
      la sala durante la grabación. Verificado: la coreografía sola cierra una ronda en 48 s
- [ ] **Grabar y montar el vídeo** (≤ 1:30)

---

## Fase 6 — Calibrado y estreno

Todo lo anterior funciona y está verificado. Lo que queda no es código: es afinar con gente
delante, que es lo único que no se puede hacer en solitario.

- [ ] **Calibrar la resistencia del paciente.** Con los tres cerrojos abiertos a veces cede
      a la primera y a veces se atasca dudando. Se toca en la sección "CUÁNDO CEDES" de
      `apps/agent/src/prompt.ts`.
- [ ] **Calibrar el umbral del paro** (`BPM_MAX`). Cinco ediciones en menos de un minuto lo
      alcanzan; con público numeroso puede resultar demasiado fácil.
- [ ] **Ajustar los cooldowns** según cuánta gente haya de verdad en la sala.
- [ ] Ensayo completo con varios navegadores (checklist en `docs/testing.md`)
- [ ] Deploy a Vercel y `portal origins add <dominio>` — sin eso el navegador queda
      bloqueado por origen no autorizado
- [ ] Fusionar el PR a `main`

---

## Ideas descartadas o aplazadas

| Idea | Decisión |
|------|----------|
| Base de datos propia (Supabase) para los secretos | Descartada: el secreto no puede vivir donde el cliente pueda leerlo, y un archivo en el repo no puede fallar en mitad de la demo |
| Supabase para un salón de la fama persistente | Aplazada a después del hackathon: es donde sí aportaría |
| Salas múltiples con objetivos distintos | Aplazada: repartir a la audiencia entre salas mata la sensación de multitud, que es la mitad del efecto. Si hace falta variedad, que sea por rondas |
| Login y cuentas | Descartada: el anonimato alimenta la dinámica vándalo/cuidador |
| Votaciones para aprobar ediciones | Descartada: mata la inmediatez, que es el corazón del efecto |
| Simplificar el anti-suplantación con la API REST de Portal | Aplazada (MEJORA-01): lo que hay está probado y no se toca antes del hackathon |
| Que el historial clínico crezca en pantallas altas | Pendiente de decisión de diseño (MEJORA-02) |
