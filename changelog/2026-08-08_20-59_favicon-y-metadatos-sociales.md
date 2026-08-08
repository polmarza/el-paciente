# Favicon, og:image y metadatos sociales

**Fecha:** 2026-08-08 20:59
**Tipo:** Feature

## Qué se hizo

Faltaba favicon y todo lo que un enlace compartido necesita para no aparecer en blanco en
Slack/Discord/Twitter/LinkedIn: `og:image`, `og:title`, `twitter:card`, etc. La meta
`description` ya existía en `index.html`; el resto no.

- `apps/web/public/favicon.svg` — el mismo motivo de electro que usa `Monitor.tsx`, en los
  colores del tema (`T.bg` de fondo, `T.vital` para el trazo). SVG, no PNG: sin herramientas
  de imagen de por medio y se ve nítido en cualquier tamaño de pestaña.
- `apps/web/public/og-image.png` (1200×630) — generado dibujando el mismo diseño en un
  `<canvas>` del navegador y extrayendo el PNG con `toDataURL`, no con una herramienta de
  captura externa: evita meter una dependencia nueva solo para esta imagen.
- `index.html` — `<link rel="icon">`, `theme-color`, y el bloque completo de `og:*` /
  `twitter:*` reutilizando la misma descripción que ya había.

## Qué se modificó

- `apps/web/index.html`
- `apps/web/public/favicon.svg` (nuevo)
- `apps/web/public/og-image.png` (nuevo)

## Por qué

El usuario preguntó si faltaba favicon, meta-descripción y og:image antes de desplegar en
Vercel — faltaban los dos primeros.

## Pendiente

`og:image`, `twitter:image` y `og:url` están puestos como rutas relativas (`/og-image.png`)
porque todavía no hay dominio de producción. Algunos rastreadores (Facebook/LinkedIn sobre
todo) resuelven mal una imagen relativa si no hay `og:url` absoluta a su lado. En cuanto el
usuario despliegue en Vercel, añadir `<meta property="og:url" content="https://…">` con el
dominio real y, si se quiere ir sobre seguro, pasar las tres rutas de imagen a absolutas.
