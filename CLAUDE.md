# CLAUDE.md

Archivo de referencia para cualquier agente de codificación que trabaje en este proyecto.
Lee este archivo completo antes de hacer cualquier cambio.

## Estado del proyecto y arranque

Antes de hacer cualquier cosa, comprueba el estado del repositorio:

1. Lee `docs/prd.md`, `docs/architecture.md` y `docs/business.md`
2. Si los tres están vacíos (solo tienen comentarios, sin contenido real):
   - No escribas código
   - No rellenes nada todavía
   - Empieza con esta pregunta: "¿Qué quieres construir y para quién?"
   - A partir de la respuesta, haz las preguntas necesarias para completar 
     los documentos de docs/ en este orden: prd.md → business.md → 
     design-system.md → architecture.md → data-model.md → roadmap.md
   - Confirma con el usuario antes de pasar al siguiente documento
   - Cuando todos estén rellenos, pregunta: "¿Empezamos a construir?"

3. Si los documentos ya tienen contenido: lee todo antes de actuar.

---

## Descripción del proyecto

<!-- Escribe aquí 3-4 líneas que expliquen qué es este proyecto, qué problema resuelve y para quién.
     Ejemplo:
     "Plataforma web para que coleccionistas de vinilos cataloguen y compartan sus colecciones.
     Usuario objetivo: adultos 25-45 con colecciones físicas que quieren digitalizar su catálogo.
     Stack principal: Next.js + Supabase + Vercel." -->

**Nombre:** <!-- nombre-del-proyecto -->
**Descripción:** <!-- una frase -->
**Estado actual:** <!-- En desarrollo / Beta / Producción -->

---

## Documentación de referencia

Lee estos archivos en este orden antes de empezar a trabajar:

1. `docs/prd.md` — Qué construimos y por qué. Fuente de verdad sobre funcionalidades.
2. `docs/architecture.md` — Stack, estructura de carpetas, decisiones técnicas.
3. `docs/data-model.md` — Esquema de base de datos, relaciones, políticas RLS.
4. `docs/design-system.md` — Colores, tipografía, componentes, tono visual.
5. `docs/business.md` — Modelo de negocio, métricas, contexto comercial.
6. `docs/roadmap.md` — Qué está en scope ahora y qué no.

Si un archivo de `docs/` no existe todavía, pregunta antes de asumir.

---

## Stack tecnológico

<!-- Completa esto con el stack real del proyecto.
     Ejemplo:
     - Framework: Next.js 14 (App Router)
     - Base de datos: Supabase (PostgreSQL + Auth + Storage)
     - Estilos: Tailwind CSS + shadcn/ui
     - Despliegue: Vercel
     - Pagos: Stripe
     - Email: Resend -->

- Framework: <!-- ... -->
- Base de datos: <!-- ... -->
- Estilos: <!-- ... -->
- Despliegue: <!-- ... -->
- Otras integraciones: <!-- ... -->

---

## Estructura de carpetas

<!-- Documenta aquí la estructura real del proyecto una vez inicializado.
     Ejemplo:
     src/
     ├── app/          → rutas (App Router)
     ├── components/   → componentes reutilizables
     ├── lib/          → utilidades, clientes de servicios externos
     ├── hooks/        → custom hooks
     └── types/        → tipos TypeScript compartidos
     
     docs/             → documentación del proyecto (ver sección anterior)
     changelog/        → registro de cambios (ver protocolo más abajo)
     mejoras/          → ideas futuras no implementadas -->

---

## Convenciones de código

<!-- Define aquí las reglas de estilo específicas del proyecto.
     Ejemplo:
     - TypeScript estricto. No usar `any`.
     - Componentes en PascalCase, archivos en kebab-case.
     - Toda función async debe manejar errores explícitamente.
     - No usar `console.log` en producción.
     - Comentarios en español. -->

- Idioma de comentarios y variables: <!-- español / inglés -->
- Nombrado de componentes: <!-- PascalCase -->
- Nombrado de archivos: <!-- kebab-case -->
- <!-- Añade más reglas según el proyecto -->

---

## Qué NO hacer

<!-- Lista de antipatrones específicos de este proyecto.
     Ejemplo:
     - No modificar el esquema de Supabase directamente desde el cliente; usar migraciones.
     - No almacenar tokens en localStorage; usar cookies httpOnly.
     - No crear componentes nuevos sin consultar docs/design-system.md primero.
     - No hacer fetch directo a APIs externas desde componentes; usar server actions o route handlers. -->

- <!-- ... -->

---

## Protocolo de cambios (obligatorio)

Cada vez que hagas un cambio importante en el proyecto, debes:

### 1. Crear entrada en changelog/

**Nombre del archivo:** `YYYY-MM-DD_HH-MM_descripcion-breve.md`

**Contenido mínimo:**
```
# [Descripción breve del cambio]

**Fecha:** YYYY-MM-DD HH:MM
**Tipo:** Feature / Fix / Refactor / Migración / Configuración

## Qué se hizo
[Descripción de lo que se implementó o modificó]

## Qué se modificó
[Lista de archivos afectados]

## Por qué
[Contexto o motivación del cambio]
```

Si la carpeta `changelog/` no existe, créala antes de escribir el archivo.

### 2. Actualizar la documentación afectada

Si el cambio afecta algo que está documentado en `docs/`, actualiza ese archivo en la misma sesión. No dejes documentación desincronizada.

Ejemplos:
- Nueva tabla en Supabase → actualizar `docs/data-model.md`
- Nuevo componente o patrón visual → actualizar `docs/design-system.md`
- Cambio en la arquitectura de carpetas → actualizar `docs/architecture.md`
- Nueva funcionalidad en scope → actualizar `docs/prd.md` y `docs/roadmap.md`

### 3. Actualizar README.md si aplica

Si el cambio afecta cómo se instala, inicializa o usa el proyecto, actualizar `README.md`.

---

## Registro de mejoras pendientes

Las ideas de mejora que no entran en el sprint actual se anotan en `mejoras/`.

**Formato sugerido:** un archivo Markdown por área temática o un único `mejoras/backlog.md`.
**Contenido mínimo por idea:** título, descripción breve, motivación, prioridad estimada.

Si la carpeta `mejoras/` no existe, créala.

---

## Notas adicionales

<!-- Cualquier otra instrucción específica del proyecto que no encaje en las secciones anteriores.
     Ejemplos: credenciales de entorno necesarias, comandos de desarrollo, quirks conocidos del stack. -->
