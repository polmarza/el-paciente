# Estrategia de testing

<!-- Documento vivo. Actualizar cuando cambie el stack o las convenciones de testing.
     Los cambios deben registrarse también en changelog/. -->

---

## Filosofía

<!-- Describe el enfoque de testing del proyecto.
     Ejemplo: "Priorizamos tests de integración sobre unitarios porque nuestro valor
     está en los flujos completos, no en funciones aisladas."
     o: "Seguimos la pirámide clásica: muchos unitarios, integración selectiva, pocos e2e." -->

---

## Stack de testing

<!-- Herramientas utilizadas por tipo de test.
     Ejemplo:
     | Tipo | Herramienta |
     |------|-------------|
     | Unitario | Vitest |
     | Integración | Vitest + Testing Library |
     | E2E | Playwright | -->

| Tipo | Herramienta |
|------|-------------|
| Unitario | <!-- --> |
| Integración | <!-- --> |
| E2E | <!-- --> |

---

## Qué testear

<!-- Distingue explícitamente qué merece test y qué no, para no perder tiempo.
     Ejemplo:
     SÍ → lógica de negocio, transformaciones de datos, componentes con estado complejo
     NO → componentes puramente visuales, integraciones con terceros (mockear en su lugar) -->

### Sí testear
- <!-- -->

### No testear (o mockear)
- <!-- -->

---

## Convenciones

<!-- Naming, ubicación de archivos, estructura interna de los tests.
     Ejemplo:
     - Archivos: `nombre.test.ts` junto al archivo que testa
     - Describe en presente: "calcula el total con descuento"
     - Un assert por test cuando sea posible -->

---

## Cobertura objetivo

<!-- Porcentaje objetivo y cómo medirlo.
     Ejemplo: ≥ 80% en lógica de negocio. Ignorar archivos de configuración y tipos. -->

---

## Cómo correr los tests

```bash
# Todos los tests
pnpm test

# Modo watch
pnpm test:watch

# Con cobertura
pnpm test:coverage

# E2E
pnpm test:e2e
```

<!-- Ajusta los comandos al stack elegido una vez relleno architecture.md. -->
