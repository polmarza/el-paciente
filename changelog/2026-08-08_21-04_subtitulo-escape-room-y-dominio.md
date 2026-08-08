# Subtítulo "escape room" y dominio elpaciente.es

**Fecha:** 2026-08-08 21:04
**Tipo:** Configuración

## Qué se hizo

Nuevo subtítulo corto, decidido por el usuario, para reemplazar la descripción larga en
todos los sitios donde hacía falta un gancho de una línea:

> Un escape room en el que tienes que descubrir qué esconde el paciente.

No es técnicamente exacto (no hay salas ni puzzles físicos), pero es una referencia que se
reconoce sin explicación previa y transmite bien la mecánica de investigar para sacarle algo
a alguien que se resiste — más que la descripción anterior, centrada en el mecanismo de
edición y no en el objetivo.

Se propagó a:
- `apps/web/index.html` — meta `description`, `og:description`, `twitter:description`.
- `apps/web/public/og-image.png` — rediseñada tras dos rondas de feedback visual. Fuera la
  cabecera de expediente (demasiado pequeña, no aportaba); el título "EL PACIENTE" pasa a
  llevar debajo la etiqueta "DIGITAL ESCAPE ROOM" en vez de la frase completa, y el trazo de
  electro gana tres latidos con amplitud distinta en vez de un único blip, para que se lea
  como monitor real y no como un icono suelto. Mismo método sin herramientas externas:
  `<canvas>` del navegador + `toDataURL`.
- `README.md` — como cita bajo el título.
- GitHub «About» del repositorio (`gh repo edit --description`) y campo «homepage»
  (`https://elpaciente.es`).
- `docs/entregables.md` — nueva sección "Subtítulo / gancho corto", documentando dónde vive
  y dejando nota de que se reutilizará en la descripción corta del formulario de entrega del
  hackathon cuando llegue el momento.

También se completó el dominio pendiente del changelog anterior: `og:url`,
`og:image` y `twitter:image` pasan de rutas relativas a `https://elpaciente.es/…` absolutas.

## Qué se modificó

- `apps/web/index.html`
- `apps/web/public/og-image.png`
- `README.md`
- `docs/entregables.md`
- GitHub: descripción y homepage del repositorio (fuera del código, vía `gh` CLI)

## Por qué

El usuario, tras ver el favicon y la og:image, decidió que la descripción original explicaba
el mecanismo pero no el objetivo con suficiente fuerza, y que la referencia a "escape room"
resume mejor qué se hace al jugar. De paso confirmó el dominio de producción
(`elpaciente.es`), pendiente desde el changelog anterior.
