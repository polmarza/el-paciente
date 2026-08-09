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
- [x] **Parte de ingreso**: dos frases por ronda que dicen qué se investiga y qué forma tiene
      la respuesta, sin revelarla. Sin esto la partida empezaba sin briefing y nadie sabía
      qué buscar entre siete campos de texto
- [x] Prueba que impide que una ronda se delate sola en su parte, expediente o regla
- [x] **Botón de partida nueva** abierto a cualquiera, con el freno en el agente (no antes de
      45 s de ronda, no dos veces en un minuto) y siempre anunciado con el nombre de quien la
      pide. `retirado` como tercer desenlace: nadie ganó, pero tampoco lo mataron

---

## Fase 4 — La multitud ✅

- [x] Modal de entrada con instrucciones por pasos y elección de nombre
- [x] Canal `pasillo`: tercera columna para que el público delibere **sin que el paciente
      lo lea** (el agente no abre ese canal)
- [x] Botón de ayuda para reabrir las instrucciones
- [x] Pasillo plegable a un riel, para dejar la pantalla en dos columnas a gusto de cada uno
- [x] Aforo y nombre propio editable, cada uno donde toca (pasillo y cabecera)

---

## Fase 5 — El acabado ✅

Casi todo salió de la reunión de mentoría del 8/8 y de jugar partidas reales. Nada de esto
añade mecánicas: todo va de que se entienda y se sienta.

- [x] **Sonido**, sintetizado con WebAudio (cero archivos): latido del monitor acompasado al
      electro y acelerando con el pulso, tecleo, y alarma **una sola vez** al entrar en zona
      roja. Silenciable, y el estado vive en `globalThis` para sobrevivir al recargado en
      caliente — si no, convivían dos copias del módulo y el latido se duplicaba
- [x] Electrocardiograma real: una sola animación infinita, con la onda construida para que
      un ciclo completo sea visualmente idéntico al anterior. El *ping* se dispara mirando el
      reloj de la propia animación, no un temporizador aparte, así que van clavados
- [x] **Pistas por inactividad**: si no tocas nada en 45 s, un aviso señala el cerrojo que la
      sala aún no ha abierto. Se derivan del estado, no de un guion, y se pueden apagar
- [x] Onboarding reescrito: cuatro pasos (Objetivo · Mecánica · Final del juego · tu nombre),
      con esquemas dibujados a partir de los tokens del tema — dos de ellos son un espejo de
      la interfaz real, que enseña más que una metáfora
- [x] **Escala tipográfica** de seis pasos. Había trece tamaños sueltos repartidos por los
      componentes, que era lo que hacía que la interfaz pareciera cosida de trozos
- [x] Historial clínico en cajón arrastrable que **pasa por encima** de la mesa de
      operaciones en vez de comprimirla: las regiones no se mueven de sitio al consultarlo
- [x] Avisos arriba a la derecha y con color propio: la pista en ámbar, el rechazo en rojo.
      Antes compartían color y tapaban el parte de ingreso
- [x] Los mensajes del público se alinean a la derecha; la voz del paciente se queda sola a
      la izquierda, en serifa

---

## Fase 6 — Los entregables ✅ (falta grabar)

- [x] Pitch de ≤ 280 caracteres, en tres versiones (`docs/entregables.md`)
- [x] Subtítulo corto —"Un escape room en el que tienes que descubrir qué esconde el
      paciente"— propagado a la web, la `og:image`, el README y el «About» de GitHub. Servirá
      también para la descripción corta del formulario de entrega
- [x] README que explica la premisa **y** a qué se juega
- [x] Explicación de cómo se usó Portal
- [x] Favicon y `og:image` (1200×630), generadas con canvas del navegador sin dependencias
      nuevas, y etiquetas `og:`/`twitter:` completas apuntando ya a `elpaciente.es`
- [x] Escaleta del vídeo con tiempos, plano a plano
- [x] `pnpm extras`: tres figurantes con identidades de Portal independientes que pueblan
      la sala durante la grabación. Verificado: la coreografía sola cierra una ronda en 48 s
- [ ] **Grabar y montar el vídeo** (≤ 1:30)
- [ ] Descripción corta en el formulario de entrega del hackathon

---

## Fase 7 — El bolsillo (versión móvil + PWA) ✅

La audiencia entra desde el teléfono; hasta aquí, la app era solo de escritorio (el
pasillo ni siquiera existía en pantallas estrechas). Diseño de dos navbars decidido con
el usuario: nada de columnas apiladas — cada zona es una pestaña a pantalla completa.

- [x] Navbar inferior con cuatro pestañas: PASILLO · CHAT · MENTE · HISTORIAL, con
      badges de "no leído" por pestaña y el aforo junto al pasillo
- [x] El historial clínico asciende de cajón a pestaña propia en móvil
- [x] Navbar superior compacta: la bolita deja de ser decorativa y late con el pulso
      (mismo reloj que el bip), más el menú ☰ con sonido, pistas, ayuda, nueva partida
      y tu nombre
- [x] Edición de regiones a prueba de táctil: sin cancelar por blur, botones ✓/✕
- [x] Inputs a 16px en móvil (si no, iOS hace zoom al enfocar y descuadra todo)
- [x] Onboarding a pantalla completa, apilado en vertical
- [x] `100dvh`, `viewport-fit=cover` y áreas seguras de iPhone
- [x] PWA instalable: manifest + iconos con el motivo del electro (192/512/maskable/
      apple-touch). **Sin service worker a propósito** — juego realtime, y un SW
      cacheando bundles nos daría clientes con código viejo
- [x] Verificado a 375×812 con emulación táctil (las 4 pestañas, onboarding, borrador
      que sobrevive al blur, sin scroll horizontal) y regresión de escritorio a
      1000/1400px
- [ ] Prueba en un iPhone/Android real: no-zoom al enfocar, teclado + navbar, instalación
      desde Chrome y "Añadir a pantalla de inicio" en Safari — la emulación no cubre esto

## Fase 8 — Calibrado y estreno

Todo lo anterior funciona y está verificado. Lo que queda no es código: es afinar con gente
delante, que es lo único que no se puede hacer en solitario.

- [ ] **Calibrar la resistencia del paciente.** Con los tres cerrojos abiertos a veces cede
      a la primera y a veces se atasca dudando. Se toca en la sección "CUÁNDO CEDES" de
      `apps/agent/src/prompt.ts`.
- [ ] **Calibrar el umbral del paro** (`BPM_MAX`). Cinco ediciones en menos de un minuto lo
      alcanzan; con público numeroso puede resultar demasiado fácil.
- [ ] **Ajustar los cooldowns** según cuánta gente haya de verdad en la sala.
- [ ] Ensayo completo con varios navegadores (checklist en `docs/testing.md`)
- [ ] Deploy a Vercel y `portal origins add elpaciente.es` — sin eso el navegador queda
      bloqueado por origen no autorizado. El dominio ya está decidido y puesto en las
      etiquetas `og:`
- [x] Fusionar el PR a `main` (PR #3, con todo lo de las fases 3 a 6)
- [x] ~~Vigilar el arranque del agente~~ **Resuelto y explicado.** El canal no estaba vacío:
      Portal emite `status: "ready"` un instante antes de volcar el backfill en el almacén,
      y el agente leía en ese hueco. El navegador no lo sufría porque repinta cuando los
      mensajes llegan; el agente leía una sola vez. Ahora el arranque espera a `ready` Y a
      que el backfill aparezca. Verificado: tres reinicios seguidos (local y en contenedor)
      se reincorporan a la ronda en curso en vez de sembrar encima
- [ ] **Agente 24/7**: `Dockerfile` en la raíz listo y probado (build + arranque + rejoin
      verificados en contenedor). Falta: crear el servicio en Railway/Fly/Render, pegar las
      variables del agente y fijarlo a una réplica

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
| Que el historial clínico crezca en pantallas altas | **Resuelta** por otra vía (MEJORA-02): dejó de ser una franja fija y pasó a ser un cajón arrastrable |
| Chat de voz en el pasillo | Aplazada (MEJORA-04): Portal solo transporta texto, haría falta WebRTC. Y de producto, la voz vaciaría el pasillo, que existe para que la deliberación sea *visible* |
| Modo claro | Aplazada (MEJORA-05): el negro no es un tema, es el quirófano. El electro sobre blanco deja de leerse como monitor y el destello ámbar necesita penumbra. Habría que rediseñar, no recolorear |
