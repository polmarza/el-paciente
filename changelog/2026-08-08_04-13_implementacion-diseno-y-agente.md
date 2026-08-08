# Implementación del diseño, la capa Portal y el agente

**Fecha:** 2026-08-08 04:13
**Tipo:** Feature

## Qué se hizo

Se pasó de documentación a producto. El diseño de Claude Design (`El Paciente.dc.html`) se
importó vía el MCP de Claude Design y se implementó como aplicación real.

**Monorepo** pnpm con `apps/web`, `apps/agent` y `packages/shared`.

**Interfaz** (`apps/web`) portada fielmente del diseño: monitor con electrocardiograma y
pulso, chat con las tres voces (humana, sistema y EL PACIENTE, con su variante de episodio
de crisis), mesa de operaciones de siete regiones con sus cuatro estados, cursores
colaborativos e historial clínico con diff. Verificada en navegador contra el diseño a
1280×720 y 1920×1080.

**Lógica compartida** (`packages/shared`): tipos de mensajes, reducer del cerebro
(historial → snapshot + log), seed, paleta de autores y cooldowns. 11 tests en verde.

**Agente** (`apps/agent`): escucha ambos canales, agrupa ráfagas de ediciones en una sola
reacción, mantiene un único turno en vuelo, construye el system prompt desde las regiones y
el historial con autores, y habla con OpenRouter con modelo de respaldo y tiempo límite.

**Middleware** (`portal.config.ts`): anti-suplantación de la IA (secreto + `mask`), límites
de longitud y cooldowns por región y por usuario.

Decisiones tomadas y documentadas: sin Tailwind (el diseño llegó en estilos inline); la IA
publica la frase entera y el navegador la teclea en local; el contrato de Portal se leyó de
los `.d.ts` del SDK en vez de la documentación, que no fija varios campos.

Se añadió `/preview.html`: la interfaz con datos fijos, para iterar sin Portal ni agente.

## Qué se modificó

- Nuevos: `apps/web/**`, `apps/agent/**`, `packages/shared/**`, `portal.config.ts`,
  `pnpm-workspace.yaml`, `tsconfig.base.json`, `tsconfig.portal.json`, `.claude/launch.json`
- Actualizados: `package.json`, `README.md`, `docs/architecture.md`, `docs/data-model.md`,
  `docs/design-system.md`, `docs/roadmap.md`

## Por qué

El diseño ya estaba listo y las credenciales de Portal y OpenRouter siguen pendientes: todo
lo que no depende de ellas se podía construir y verificar por adelantado, para que al llegar
las claves solo quede desplegar la config y probar en vivo.

## Pendiente de verificación

Nada de esto ha hablado todavía con Portal de verdad. El código está escrito contra los tipos
reales del SDK (`@portalsdk/core@0.1.5`) y compila, pero el primer contacto real es la Fase 3
del roadmap.
