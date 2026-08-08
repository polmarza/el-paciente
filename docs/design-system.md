# Design System

Fuente de verdad visual del proyecto.

**Estado:** dirección definida; los tokens finales (paleta exacta, tipografías) los fijará
el diseño que Pol está produciendo con Claude Design. Al recibirlo, actualizar este archivo
en la misma sesión. Lo que sigue es la dirección que ese diseño debe respetar y los
requisitos estructurales que la implementación necesita sí o sí.

---

## Concepto visual

**Quirófano nocturno / monitor de paciente.** La interfaz es el instrumental médico
alrededor de una mente abierta. Oscura, clínica, con la tensión de un electrocardiograma:
calma tensa interrumpida por picos cuando alguien edita.

- El **chat** es la voz del paciente: humana, cálida, vulnerable.
- El **cerebro** es la mesa de operaciones: fría, precisa, cuadriculada.
- El contraste entre ambas mitades ES el mensaje.

Qué NO debe parecer: un dashboard SaaS genérico, un chat de soporte, algo "cyberpunk
neón" cliché. La referencia emocional es hospital + performance art, no hacker.

---

## Paleta de colores

Provisional hasta recibir el diseño de Claude Design. Roles que el diseño debe cubrir:

| Rol | Uso | Provisional |
|-----|-----|-------------|
| Background | Fondo base, casi negro con temperatura fría | `#0A0E12` |
| Surface | Cards de slots, burbujas de chat | `#12181F` |
| Primary / Vital | Color "signo vital": acentos, latido, cursor de la IA | `#3DE8A0` (verde monitor) |
| Alert | Ediciones recientes, crisis de identidad, cooldown | `#FF4D5E` |
| Text primary | Texto principal | `#E8EDF2` |
| Text secondary | Metadatos, timestamps, log | `#7A8794` |
| Cursores de usuarios | Un color estable por nickname (hash → hue) | HSL rotado, saturación fija |

---

## Tipografía

A confirmar con el diseño. Requisitos:

- **Voz de la IA (chat):** una fuente con humanidad — serif o humanist sans. Nunca mono.
- **Cerebro, log y datos:** monoespaciada (registro clínico, historial médico).
- Legible en proyector a 3 metros: cuerpo del chat ≥ 16 px, slots ≥ 14 px.

---

## Espaciado y grid

- Layout principal: **split-screen** ~55 % chat / 45 % cerebro en desktop (≥ 1024 px).
  En móvil, pestañas o apilado — funcional, sin más.
- Escala de espaciado base 4 px.
- El log de ediciones vive con el cerebro (feed compacto bajo los slots).

---

## Estilo de componentes

- **Slot de memoria:** card con etiqueta del slot, contenido, autor de la última edición y
  su timestamp. Estados: reposo, hover, en edición (por mí), en edición (por otro — mostrar
  quién), recién editado (destello `Alert` que decae en ~3 s), en cooldown (bloqueado con
  cuenta atrás visible).
- **Cursores colaborativos:** etiqueta flotante con nickname + color propio sobre el slot
  que el usuario está mirando/editando. Movimiento suave, desaparición por inactividad.
- **Mensajes del chat:** los de la IA claramente distintos (avatar/latido, color Vital).
  Streaming visible carácter a carácter. Mensajes de sistema ("X editó el miedo de EL
  PACIENTE") como interrupciones clínicas en el propio chat.
- **Animación:** funcional, no decorativa. Lo único siempre animado: un latido sutil
  (la IA "está viva"). Picos de animación solo en ediciones y crisis.

---

## Tono visual

Solemne con humor negro. La UI se toma en serio a sí misma — como un expediente médico —
y por eso las barbaridades que escribe la multitud resultan aún más cómicas. La información
es la protagonista: cero ornamento que no comunique estado.

---

## Componentes definidos

Se documentarán aquí a medida que se implementen (BrainSlot, EditLog, ChatStream,
PresenceBar, VitalsMonitor…).

---

## Referencias visuales

- Monitores de constantes vitales (Philips IntelliVue) — jerarquía de datos en oscuro.
- r/place — energía de multitud sobre un lienzo compartido.
- El diseño final llegará de Claude Design a partir del prompt preparado en esta sesión.
