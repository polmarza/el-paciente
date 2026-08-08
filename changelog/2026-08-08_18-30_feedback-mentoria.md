# Feedback de mentoría: unificación visual, onboarding con dibujos, sonido y pistas

**Fecha:** 2026-08-08 18:30
**Tipo:** Feature

## Qué se hizo

Cuatro de los cinco puntos del feedback de mentoría del 8/8. El quinto (chat de voz) queda
anotado como MEJORA-04 con su porqué.

### Unificación tipográfica y de color

El diagnóstico del mentor era correcto: tres columnas × tres familias tipográficas leían
como tres aplicaciones pegadas. La receta aplicada difiere de la sugerida ("mono + sans
para todo") para no matar lo más distintivo del diseño:

- **Dos familias: IBM Plex Mono para todo, Lora solo para la voz de EL PACIENTE.** Fuera
  Instrument Sans. Todos escriben con la tipografía de la máquina; el único que habla con
  tipografía humana es la IA. El contraste "dos mundos" se muda de "panel contra panel" a
  "todos contra él".
- **Gama fría unificada** en las tres columnas: el fondo cálido del chat desaparece y la
  calidez queda concentrada en las burbujas del paciente.
- El diploma descargable acompaña el cambio (la sans también salió de ahí).

### Onboarding con dibujos y frases cortas

Reescrito: **una frase por paso** y un esquema SVG dibujado con los tokens del tema
(la rejilla de la mente, el cursor sobre una región, el candado → la burbuja, el electro
que se acelera). Iconografía clínica de trazo simple, inline, sin assets externos.

### Sonido, sintetizado con WebAudio

Cero archivos, cero dependencias, y solo dos fuentes — el sonido funciona por escasez:

- **Tecleo** mientras el paciente escribe: soplos de ruido filtrado (~25 ms), uno cada
  ~90 ms, con variación aleatoria de tono para que no suene a metralleta.
- **Ping de monitor de hospital** con cada edición del cerebro: un latido audible por
  corte, que sube medio tono cuando el pulso va alto — como las máquinas de verdad.
- Silenciador (♪) en la cabecera, persistido. El backfill al conectar no suena: solo las
  ediciones que llegan en vivo.
- El desbloqueo de audio del navegador se resuelve con el primer gesto (el clic de
  "ENTRAR AL QUIRÓFANO" cuenta).

### Pistas por inactividad

Sin acción del usuario (hablar o editar) durante 45 s, un toast señala **el cerrojo que la
sala aún no ha tocado**: primero la regla, luego el miedo, luego el permiso, y si todo está
abierto, rematar. Máximo una pista por minuto; calla durante el onboarding y el relevo.

## Verificación en vivo

- Onboarding recorrido entero como usuario nuevo: los cuatro dibujos renderizan.
- Tipografía comprobada por DOM: todos los `span` de las tres columnas en IBM Plex Mono,
  y la voz del paciente sigue en Lora.
- Botones ♪ y ? presentes en la cabecera.
- Pista por inactividad verificada esperando la ventana de 45 s.

## Qué se modificó

- `apps/web/src/theme.ts` (dos familias, gama fría), `styles.css`, `index.html`,
  `preview.html`
- `apps/web/src/components/`: `Onboarding.tsx` (reescrito), `ChatPane.tsx`,
  `PasilloPane.tsx`, `RoundOverlay.tsx`, `Monitor.tsx` (♪)
- `apps/web/src/lib/sound.ts` (nuevo), `lib/diploma.ts`
- `apps/web/src/hooks/useAiReveal.ts` (tecleo audible)
- `apps/web/src/App.tsx` (ping por edición, pistas por inactividad)
- `mejoras/backlog.md` (MEJORA-04: chat de voz, aplazado con su porqué)

## Decisión respecto al feedback

El chat de voz se aplaza por dos razones. La técnica: Portal no lo soporta (mensajes de
texto ≤2KB; los tipos de media están "reservados, rechazados en v1" según los tipos del
SDK), así que exigiría WebRTC y otra integración. La de producto, que pesa más: la voz
vaciaría el pasillo, y el pasillo existe para que la deliberación sea visible — en la demo
es lo que demuestra que hay una multitud coordinándose.
