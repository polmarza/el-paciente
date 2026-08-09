# Versión móvil (dos navbars, cuatro pestañas) y PWA instalable

**Fecha:** 2026-08-09 02:25
**Tipo:** Feature

## Qué se hizo

La app era solo de escritorio: en pantallas estrechas el pasillo ni siquiera existía
(`display:none` desde 1250px) y el resto se apilaba inutilizable. La audiencia entra desde
el móvil, así que faltaba media sala. Diseño decidido con el usuario: **dos navbars**, nada
de columnas apiladas — cada zona es una pestaña a pantalla completa.

### El shell (≤700px)

- **Navbar inferior** (`MobileTabBar`): PASILLO (con el aforo) · CHAT (por defecto) ·
  MENTE (mesa + parte de ingreso) · HISTORIAL. Badges ámbar de "no leído" por pestaña
  (`useUnreadCounts`: contador de vistos por pestaña, la activa siempre a cero, con clamp
  para cuando el relevo vacía los canales).
- **El historial asciende de cajón a pestaña** (`HistorialPane`, reutilizando la lista
  extraída de `EditLog` como `LogEntries`): en un teléfono, un cajón desplegándose taparía
  justo la mesa que estás mirando.
- **Navbar superior**: `Monitor` compacto de una fila. La bolita verde deja de ser
  decorativa — **late una vez por ciclo del pulso y es el ping visual**, con el mismo
  reloj WAAPI que dispara el bip (verificado: período 1548ms para 108 LPM, exacto), roja
  en zona de alarma. Sustituye al electro; expediente y reloj se sacrifican en 375px. A la
  derecha, menú ☰ (`BurgerMenu`): sonido, pistas, cómo se juega, nueva partida con su
  confirmación de dos toques, y tu nombre.
- Los cuatro paneles quedan **montados y superpuestos** (las suscripciones de Portal viven
  en los hooks de App, así que cambiar de pestaña no toca los canales); se oculta con
  `visibility` según `data-tab` — `display:none` resetearía el scroll en Safari.

### Táctil e iOS

- **La edición de una región ya no se cancela por blur en móvil** — cerrar el teclado
  virtual dispara blur y tiraba el borrador. Botones ✓ GUARDAR / ✕ con `onPointerDown`
  (gana a cualquier blur). Verificado: el borrador sobrevive a un blur y ✓ confirma.
- **Inputs a 16px** vía regla CSS `!important` sobre `chat-input`/`slot-input` (con menos,
  iOS hace zoom al enfocar y descuadra el shell); `input-grande` exime al del onboarding,
  que ya iba a 18px. Los estilos inline no pueden ganar esto de otra forma.
- `100dvh` con fallback (clase `.paciente-app`), `viewport-fit=cover` y
  `env(safe-area-inset-bottom)` en la navbar.
- Onboarding a pantalla completa apilado en vertical; los SVG de los pasos pierden su
  altura fija (escalan por aspecto — en escritorio el resultado es idéntico).
- ⚠️ Las media queries de escritorio existentes se re-acotan a `min-width: 701px` — sin
  eso, el `display:none` del pasillo mataba su pestaña en móvil.

### PWA

- `public/manifest.webmanifest` (standalone, colores del tema) + iconos con el motivo del
  electro: 192, 512, maskable 512 (trazo encogido a la zona segura) y apple-touch-icon 180,
  generados con Pillow desde la misma geometría del favicon.
- **Sin service worker a propósito**: Chrome ya no lo exige para instalar, el juego es
  realtime (el offline no significa nada) y un SW cacheando bundles nos daría clientes con
  código viejo — ya sufrimos el equivalente con la caché normal del navegador.

### Verificación

A 375×812 con emulación táctil sobre `/preview.html` (ampliado: monta el pasillo y el
historial, `?tab=…` y `?onboarding=1` nuevos): las cuatro pestañas, cabecera compacta,
burger, onboarding completo, borrador que sobrevive al blur, sin scroll horizontal, inputs
a 16px computados. Regresión de escritorio a 1400px (tres columnas, cajón, monitor
completo) y del rango 701–1250 (pasillo oculto, 55/45). Manifest e iconos sirviendo 200.
Pendiente de dispositivo real (no emulable): no-zoom al enfocar, teclado + navbar,
instalación real.

## Qué se modificó

- Nuevos: `hooks/useIsMobile.ts`, `hooks/useUnreadCounts.ts`, `components/MobileTabBar.tsx`,
  `components/HistorialPane.tsx`, `components/BurgerMenu.tsx`, `public/manifest.webmanifest`,
  `public/icon-*.png`, `public/apple-touch-icon.png`.
- `App.tsx` (shell), `styles.css` (media queries + reglas móviles), `Monitor.tsx`
  (compacto + bolita-latido), `BrainPane/BrainSlot` (prop mobile, botones táctiles),
  `PasilloPane` (prop plegable), `EditLog` (extrae `LogEntries`), `Onboarding`,
  `RoundOverlay`, `Toast`, `preview.tsx`, `index.html`/`preview.html` (viewport + PWA).
- Docs: `design-system.md` (apartado Móvil), `architecture.md` (PWA sin SW),
  `roadmap.md` (Fase 7 nueva; el calibrado pasa a Fase 8).

## Por qué

Pedido por el usuario ("planifica la versión mobile; el reto más grande está en tener las
tres columnas de forma separada"), con el diseño de dos navbars y la PWA definidos por él
sobre la propuesta inicial de tres pestañas.
