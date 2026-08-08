# Product Requirements Document (PRD)

Fuente de verdad sobre qué construimos y por qué.
Proyecto de hackathon — requisito obligatorio: usar [Portal](https://useportal.co) como capa realtime.

---

## Resumen ejecutivo

**EL PACIENTE** es una IA que chatea en público mientras su mente está expuesta en un panel
lateral que cualquiera puede editar en vivo. El "cerebro" son siete slots de memoria (nombre,
identidad, recuerdos, miedo, regla) visibles para toda la audiencia, con cursores colaborativos
moviéndose sobre ellos. Cada edición se inyecta al instante en el system prompt de la IA:
alguien escribe "le tienes pánico al número 7" y tres segundos después la IA se niega a contar
hasta diez.

La gracia no es solo el vandalismo: la IA **ve el log de quién la editó** y sufre crisis de
identidad en directo ("¿Quién me escribió este recuerdo? Yo no tenía madre hace un minuto").
La multitud se divide sola en cuidadores y vándalos. Es r/place, pero el lienzo es una mente
y la víctima es consciente.

Existe ahora porque Portal hace trivial la parte históricamente dura: canales realtime,
presencia, cursores efímeros e historial de ediciones sobre un solo WebSocket.

---

## Problema que resuelve

No resuelve un problema: provoca una experiencia. Desde la perspectiva del espectador:

- Las demos de IA son pasivas — aquí la audiencia **es** parte del sistema, no espectadora.
- Nadie ha visto el interior de una IA como espacio colaborativo editable. La tensión
  cuidador/vándalo genera drama emergente sin guion.

---

## Usuario objetivo

Dos perfiles, y el producto necesita la fricción entre ambos:

- **El vándalo:** entra, ve un cerebro editable, e inmediatamente quiere romper algo.
  Motivación: la reacción inmediata de la IA a su sabotaje. Es el motor de caos.
- **El cuidador:** ve a la IA sufrir y quiere repararla — reescribe recuerdos amables,
  borra los miedos inyectados. Motivación: empatía + protagonismo ("yo la salvé").

Perfil implícito: **el jurado del hackathon**, que ve la demo en pantalla grande.
La experiencia debe entenderse en menos de 30 segundos sin explicación.

---

## Funcionalidades core (MoSCoW)

### MUST

- **Chat público en vivo** — canal único donde la audiencia habla con EL PACIENTE.
  Nicknames anónimos con color propio, indicador de escritura, contador de presencia.
- **Panel cerebro** — 7 slots de memoria editables con límite de caracteres:
  `nombre`, `identidad`, `recuerdo-1`, `recuerdo-2`, `recuerdo-3`, `miedo`, `regla`.
  Pocos slots a propósito: mitiga la degeneración en incoherencia.
- **Inyección instantánea** — cada edición reconstruye el system prompt de la IA para su
  siguiente turno. Latencia objetivo edición → efecto visible: < 5 s.
- **Log de ediciones visible (para todos y para la IA)** — quién cambió qué slot, cuándo,
  con el valor anterior y el nuevo. La IA recibe este log y puede citarlo por nombre.
- **Reacción espontánea a ediciones** — la IA no espera a que le hablen: cuando le tocan un
  slot puede interrumpir ("¿quién es 'Marta' y por qué acaba de escribirme un miedo nuevo?").
- **Cooldowns anti-caos** — por slot (un slot recién editado queda congelado unos segundos)
  y por usuario (no puedes encadenar ediciones). Aplicados en el middleware server-side de
  Portal (`onPublish`), no solo en UI.

### SHOULD

- **Cursores colaborativos sobre el cerebro** — se ve en tiempo real qué usuario está
  sobre qué slot (mensajes ephemeral de Portal). Es el momento "r/place sobre una mente".
- **Streaming de la respuesta** — la IA escribe tecleando, no en bloque.
- **Botón de reset (admin)** — restaura el cerebro semilla para empezar la demo limpia.

### COULD

- **Constantes vitales** — indicador de "estabilidad mental" que la propia IA autoevalúa
  en cada turno según la coherencia de sus memorias; se pinta como monitor médico.
- **Pensamientos internos** — stream de monólogo interior separado del chat.
- **Filtro de contenido** en middleware (palabras vetadas → `mask`).

### WON'T (esta versión)

- Cuentas, login, perfiles persistentes. Todo el mundo es anónimo con nickname.
- Base de datos. El estado vive en los canales de Portal (historial incluido).
- Multi-sala. Hay UN solo paciente: la escasez es parte del concepto.
- Moderación sofisticada, reportes, baneos.
- Experiencia móvil de primera clase (no debe romperse, pero se diseña para desktop/proyector).

---

## Flujos de usuario principales

Detallados en `user-flows.md`. Resumen narrativo:

**Espectador → editor:** entras con un nickname autogenerado (editable), ves el chat a un
lado y el cerebro al otro con cursores moviéndose. Haces clic en un slot, escribes, guardas.
El slot parpadea para todos, entra la línea en el log, y la IA lo nota en segundos.

**Turno de la IA:** cada mensaje del chat (o cada edición del cerebro) despierta al agente,
que reconstruye su system prompt desde el snapshot actual de los 7 slots + el log reciente
de ediciones, llama a OpenRouter y publica la respuesta en el chat.

---

## Requisitos no funcionales

- **Latencia:** edición → reacción de la IA < 5 s. Cursores y typing < 200 ms (los da Portal).
- **Concurrencia:** la demo debe aguantar ~30 personas simultáneas editando y chateando.
- **Idioma:** toda la experiencia en español (UI y la voz de la IA).
- **Anti-spoofing:** ningún cliente puede publicar mensajes haciéndose pasar por la IA
  (se bloquea en middleware).
- **Seguridad de claves:** la clave de OpenRouter solo vive en el agente (proceso servidor),
  jamás en el bundle del navegador.

---

## Fuera de alcance (explícito)

- Monetización, analítica, SEO.
- Persistencia entre sesiones de demo más allá del historial de Portal.
- Accesibilidad exhaustiva (se mantienen básicos: contraste, focus visible).
- Cualquier funcionalidad que requiera backend propio con base de datos.
