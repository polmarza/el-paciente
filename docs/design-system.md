# Design System

Fuente de verdad visual del proyecto.

**Origen:** diseño de Claude Design (`El Paciente.dc.html`, proyecto "El Paciente: IA editable
en vivo"). Los tokens de esta página están extraídos de ese archivo e implementados en
`apps/web/src/theme.ts` (colores y fuentes) y `apps/web/src/styles.css` (animaciones).
Si cambia el diseño, se actualizan los tres a la vez.

---

## Concepto visual

**Quirófano nocturno / monitor de paciente.** Dos mundos en una pantalla:

- El **chat** es la voz del paciente: fondo cálido, tipografía con serifa, humana y vulnerable.
- El **cerebro** es la mesa de operaciones: fondo frío, monoespaciada, cuadriculada.
- El contraste entre ambas mitades ES el mensaje.

Solemne con humor negro: la interfaz se toma en serio a sí misma — como un expediente
médico — y por eso las barbaridades que escribe la multitud resultan más cómicas.

Qué NO debe parecer: dashboard SaaS, chat de soporte, cyberpunk neón.

---

## Paleta de colores

Definida en `apps/web/src/theme.ts` como el objeto `T`. No usar colores sueltos en componentes.

### Superficies

| Rol | Token | Hex |
|-----|-------|-----|
| Fondo base | `bg` | `#07090b` |
| Monitor (cabecera) | `monitorBg` | `#0a0e11` |
| Chat (degradado) | `chatBg` | `#141110` → `#0f0c0b` |
| Cerebro | `brainBg` | `#060a0d` |
| Región de memoria | `slotBg` | `#0a1114` |
| Región bloqueada | `slotBgCooldown` | `#070c0f` |

### Texto

| Rol | Token | Hex |
|-----|-------|-----|
| Destacado | `textBright` | `#dce8e6` |
| Datos monoespaciados | `textMono` | `#7e949c` |
| Secundario | `textDim` | `#4f636b` |
| Contenido de región | `slotContent` | `#cfdedd` |
| Mensaje humano | `humanText` | `#ddd2c4` |
| Voz de la IA | `aiText` | `#efe4d4` |
| Voz de la IA en crisis | `aiTextCrisis` | `#f2ddd3` |

### Acentos

| Rol | Token | Hex | Cuándo |
|-----|-------|-----|--------|
| Signo vital | `vital` | `#57d9a3` | Pulso normal, valores nuevos en el log |
| Aforo | `online` | `#9be89b` | Gente conectada; color del propio espectador |
| Alarma | `alarm` | `#e05c5c` | Pulso > 95 LPM, desconexión, punto del historial |
| Intervención | `amber` | `#e0a43c` | Destello de región recién editada |
| Episodio | `aiNameCrisis` | `#e08c7d` | Encabezado de la IA en crisis de identidad |

### Colores de autor

Cada espectador recibe un color estable derivado de su nickname (hash FNV-1a sobre una
paleta de 10, en `packages/shared/src/colors.ts`). El verde `#9be89b` está **reservado** al
propio espectador. El color viaja dentro de cada mensaje, para que el historial se pinte
igual aunque su autor ya no esté conectado.

---

## Tipografía

Tres familias, cargadas desde Google Fonts en `index.html`:

| Uso | Fuente | Dónde |
|-----|--------|-------|
| Voz de la IA | **Lora** (serifa), 19px/1.55 | Mensajes de EL PACIENTE |
| Voz humana | **Instrument Sans**, 16.5px/1.45 | Mensajes del público, input del chat |
| Datos clínicos | **IBM Plex Mono**, 10.5–14.5px | Monitor, regiones, historial, nicknames |

Legibilidad en proyector: el chat no baja de 16px.

---

## Espaciado y layout

- Tres columnas: **pasillo (20%) · chat (resto) · cerebro (35%)**. El pasillo se pliega a un
  riel de 42px a gusto del espectador (persistido en `localStorage`); el chat absorbe el
  espacio que deja libre en vez de llevar un ancho fijo. Por debajo de 1250px el pasillo
  desaparece del todo (proyector estrecho); por debajo de 900px se apila (`styles.css`).
- La mesa de operaciones es una rejilla de 2 columnas. Los tres recuerdos ocupan la fila
  entera (`span 2`); nombre, identidad, miedo y regla ocupan media (`span 1`).
- Debajo de la mesa, el **parte de ingreso** (`CaseBrief`): dos frases fijas del `seed` que
  dicen qué se investiga sin decir la respuesta. Sin esto la partida no tenía briefing.
- El historial clínico es un **cajón arrastrable** (`EditLog`) anclado al fondo del panel
  cerebro, cerrado por defecto. Se abre con un clic o arrastrando su pestaña hacia arriba, y
  **pasa por encima** de la mesa de operaciones en vez de comprimirla — las regiones son el
  juego y no deben reordenarse cada vez que alguien consulta el historial.

---

## Estados de una región

El componente `BrainSlot` los implementa todos. Son el corazón de la interfaz:

| Estado | Borde | Señal | Duración |
|--------|-------|-------|----------|
| Reposo | `slotBorder` | — | — |
| En edición (por otro) | color del editor | Etiqueta flotante `@nick` con cursor parpadeante (`tagBob`) | Mientras dure |
| En edición (por mí) | — | La cita se sustituye por un input | Mientras dure |
| Recién editada | `slotBorderFlash` | `▲ EDITADO` + destello ámbar (`slotFlash`) | 4 s |
| Bloqueada | `slotBorderCooldown` | `BLOQUEADO m:ss` + trama diagonal | 25 s |

---

## Animaciones

Todas en `styles.css`. Funcionales, nunca decorativas:

- `pulseDot` — el latido permanente. Dice "esto está vivo".
- `ecg` — el electrocardiograma del monitor.
- `slotFlash` — el destello de una región recién intervenida.
- `tagBob` + `blink` — la etiqueta del cursor ajeno y los cursores de texto.
- `toastInRight` — la entrada del aviso (pista o rechazo), deslizando desde la derecha.

Se respeta `prefers-reduced-motion`.

---

## Componentes definidos

| Componente | Propósito |
|------------|-----------|
| `Monitor` | Cabecera: identidad, pulso (ECG + LPM), reloj de sesión, aforo |
| `ChatPane` | La voz: mensajes de sistema, humanos y de la IA; typing; composer |
| `BrainPane` | La mesa de operaciones: rejilla de regiones + parte + historial |
| `BrainSlot` | Una región con todos sus estados |
| `CaseBrief` | El parte de ingreso: qué se investiga, sin decir la respuesta |
| `EditLog` | Historial clínico en cajón arrastrable, diff tachado → valor nuevo |
| `Toast` | Aviso arriba a la derecha: pista (ámbar) o rechazo del middleware (rojo) |

---

## Previsualización sin Portal

`pnpm dev` y abrir **`/preview.html`** renderiza la interfaz con datos fijos que replican el
estado del diseño (Aurelio, el concurso de tortillas, el cursor de @marta sobre MIEDO).
Sirve para iterar el aspecto sin gastar cuota ni levantar el agente. No publica ni recibe
nada: la aplicación real es `/index.html`.

---

## Referencias visuales

- Monitores de constantes vitales de hospital — jerarquía de datos en oscuro.
- Expedientes médicos, r/place, cursores multijugador de Figma.
