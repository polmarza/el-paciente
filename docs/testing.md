# Estrategia de testing

Documento vivo. Contexto: hackathon — el tiempo de test se invierte donde un fallo
mataría la demo, y en nada más.

---

## Filosofía

Testear lo que es lógica pura y barato de testear (el reducer del cerebro, la construcción
del prompt, las reglas de cooldown); verificar a mano lo que es realtime y visual. El ensayo
completo de la demo con varios navegadores ES nuestro test e2e.

---

## Stack de testing

| Tipo | Herramienta |
|------|-------------|
| Unitario | Vitest (en `packages/shared` y `apps/agent`) |
| Integración | Manual: 2+ navegadores contra Portal real |
| E2E | Ensayo del guion de demo (checklist abajo) |

---

## Qué testear

### Sí testear (unitario)

- **Reducer del cerebro** (`packages/shared/brain.ts`): historial → slots; seed resetea;
  last-write-wins; edición sobre slot inexistente se ignora.
- **Construcción del system prompt** (`apps/agent/src/prompt.ts`): incluye los 7 slots,
  la capa fija no editable va siempre primero, el log reciente se trunca al límite.
- **Reglas de cooldown** (lógica pura compartida con `portal.config.ts`): por slot,
  por usuario, límites de caracteres.

### No testear (o mockear)

- Portal SDK y OpenRouter (terceros; se mockean en los tests del agente).
- Componentes visuales, animaciones, cursores.

---

## Convenciones

- Archivos `nombre.test.ts` junto al archivo que testan.
- Describe en presente: `"resetea los slots al recibir un seed"`.
- Sin snapshots de UI.

---

## Cobertura objetivo

Sin porcentaje objetivo. Regla: las tres zonas de "Sí testear" tienen tests que pasan
antes de cada fase demostrable del roadmap.

---

## Checklist de ensayo (pre-demo, manual)

1. Dos navegadores + un móvil conectados: chat, presencia y typing fluyen.
2. Editar `miedo` → destello + log + reacción de la IA en < 5 s.
3. Violación de cooldown → toast con motivo del middleware.
4. Intentar publicar `role: "ai"` desde la consola del navegador → bloqueado.
5. Matar y relanzar el agente en mitad de la conversación → se reincorpora sin duplicar seed.
6. Reset (FLOW-05) → cerebro semilla + anuncio en chat.
7. Caída de red de 10 s → reconexión sola, sin refrescar.

## Cómo correr los tests

```bash
pnpm test        # todos los unitarios (workspace)
pnpm test:watch  # modo watch
```
