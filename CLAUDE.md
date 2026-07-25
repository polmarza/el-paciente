# CLAUDE.md

Archivo de referencia para cualquier agente de codificación que trabaje en este proyecto.
Lee este archivo completo antes de hacer cualquier cambio.

## Estado del proyecto y arranque

Antes de hacer cualquier cosa, comprueba el estado del repositorio:

1. Lee todos los archivos de `docs/`
2. Comprueba si existe la carpeta `.template/`. Si existe, este repo sigue siendo la plantilla
   sin inicializar: hay andamiaje, todavía no hay proyecto.
3. Si los documentos están vacíos o incompletos (solo tienen comentarios, sin contenido real):
   - No escribas código
   - No rellenes nada todavía
   - Empieza con esta pregunta: "¿Qué quieres construir y para quién?"
   - A partir de la respuesta, haz las preguntas necesarias para completar 
     los documentos de docs/ en este orden: prd.md → business.md → 
     design-system.md → architecture.md → data-model.md → roadmap.md → user-flows.md
   - Confirma con el usuario antes de pasar al siguiente documento
   - Cuando todos estén rellenos, ejecuta la **inicialización del proyecto** (sección
     siguiente) y solo después pregunta: "¿Empezamos a construir?"

4. Si los documentos ya tienen contenido: lee todo lo que haya en `docs/` antes de actuar.
   Si además `.template/` sigue existiendo, la inicialización quedó a medias: avisa al usuario
   y ofrécete a completarla antes de seguir.

---

## Inicialización del proyecto (una sola vez)

Esta plantilla se distribuye con documentación que habla **de la plantilla**, no del proyecto.
En cuanto los documentos de `docs/` estén rellenos, conviértela en el repo de *este* proyecto.
Hazlo por iniciativa propia, sin esperar a que el usuario lo pida.

Puedes lanzar el proceso completo con `/init-proyecto`.

**Checklist de inicialización:**

1. **`README.md`** — reescríbelo entero para el proyecto, a partir de lo que hay en `docs/`.
   Debe explicar el producto, no la plantilla. Estructura sugerida: nombre y descripción de
   una línea, qué problema resuelve, requisitos previos, variables de entorno (referencia a
   `.env.example`), instalación y desarrollo (`pnpm install`, `pnpm dev`), estructura de
   carpetas, cómo contribuir (referencia a `CLAUDE.md` y al protocolo) y estado del proyecto.
2. **`CLAUDE.md`** — rellena los placeholders de este mismo archivo: nombre, descripción,
   estado, stack tecnológico, estructura de carpetas, convenciones de código y "Qué NO hacer".
   Borra los comentarios `<!-- ... -->` que ya no apliquen, esta sección de inicialización
   (deja de tener sentido una vez hecha), el comando `.claude/commands/init-proyecto.md` y las
   referencias a `.template/` del arranque y del protocolo de changelog.
3. **`LICENSE`** — sustituye `[YEAR]` y `[AUTHOR]` por los valores reales. Pregunta el nombre
   del autor si no lo sabes.
4. **`.env.example`** — deja solo las variables que el stack elegido necesita de verdad.
5. **`changelog/`** — debe quedar sin entradas heredadas. Crea la primera entrada real del
   proyecto (tipo: Configuración) describiendo la inicialización, y quita de
   `changelog/README.md` la referencia a la plantilla (o borra el archivo).
6. **`mejoras/backlog.md`** — borra el ejemplo comentado y déjalo listo para entradas reales.
7. **`.template/`** — bórrala entera (`rm -rf .template`). Es el historial de la plantilla, no
   del proyecto.
8. **Verificación final** — busca referencias sobrantes:
   `grep -ril "plantilla\|template" . --exclude-dir=.git --exclude-dir=node_modules`.
   Revisa cada resultado y corrígelo si habla de la plantilla en lugar del proyecto.

**Regla general:** después de la inicialización, ningún archivo del repo debe describirse a sí
mismo como plantilla ni explicar cómo usar la plantilla. Toda la documentación habla del
producto que se está construyendo. Si más adelante encuentras un resto de la plantilla en
cualquier archivo, corrígelo en esa misma sesión.

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

Lee todo lo que haya en `docs/` antes de empezar a trabajar. Si algún archivo está vacío
(solo tiene comentarios) o incompleto, pregunta al usuario para rellenarlo antes de actuar.

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

- Gestor de paquetes: pnpm v11. No usar npm ni yarn.
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

- No usar `npm` ni `yarn`. Siempre `pnpm` (v11).
- <!-- ... -->

---

## Protocolo de cambios (obligatorio)

Cada vez que hagas un cambio importante en el proyecto, debes:

### 1. Crear entrada en changelog/

Usa `/changelog` para crear la entrada siguiendo el formato del proyecto.

**Nombre del archivo:** `YYYY-MM-DD_HH-MM_descripcion-breve.md`

**Contenido mínimo:**
```
# [Descripción breve del cambio]

**Fecha:** YYYY-MM-DD HH:MM
**Tipo:** Feature / Fix / Refactor / Migración / Documentación / Configuración

## Qué se hizo
[Descripción de lo que se implementó o modificó]

## Qué se modificó
[Lista de archivos afectados]

## Por qué
[Contexto o motivación del cambio]
```

Si la carpeta `changelog/` no existe, créala antes de escribir el archivo.

Mientras el repo siga siendo la plantilla sin inicializar (existe `.template/`), los cambios
sobre el andamiaje se registran en `.template/changelog/`, no en `changelog/`. Así quien use la
plantilla arranca con el changelog limpio.

### 2. Actualizar la documentación afectada

Si el cambio afecta algo que está documentado en `docs/`, actualiza ese archivo en la misma sesión. No dejes documentación desincronizada.

Ejemplos:
- Nueva tabla en Supabase → actualizar `docs/data-model.md`
- Nuevo componente o patrón visual → actualizar `docs/design-system.md`
- Cambio en la arquitectura de carpetas → actualizar `docs/architecture.md`
- Nueva funcionalidad en scope → actualizar `docs/prd.md` y `docs/roadmap.md`

### 3. Actualizar README.md si aplica

Si el cambio afecta cómo se instala, inicializa o usa el proyecto, actualizar `README.md`.

El `README.md` describe siempre el proyecto en su estado actual. Si encuentras en él (o en
cualquier doc) restos de la plantilla, reescríbelos en esta misma sesión.

### 4. Revisión de seguridad

Antes de mergear a producción, o cuando el usuario lo pida, ejecuta `/security-review`.
Analiza los cambios en busca de vulnerabilidades, credenciales expuestas y problemas de seguridad.

---

## Protocolo de pull requests

**El agente es quien debe crear los PRs**, no el usuario. Así la plantilla llega rellena y el checklist verificado. Para abrir un PR, dile al agente:

> "Abre un PR con estos cambios" o usa `/autopilot` para el flujo completo.

Si por algún motivo abres el PR manualmente desde GitHub, tendrás que rellenar la plantilla a mano — es el comportamiento esperado de GitHub, no un error del flujo.

---

Cuando el agente crea un PR, debe rellenar la plantilla de `.github/pull_request_template.md` completa antes de enviarlo:

1. Rellena las secciones `¿Qué se hizo?` y `Motivación` con el contexto real del cambio (no dejarlo en blanco ni con el placeholder).
2. Marca con `[x]` la casilla correcta en `Tipo de cambio`. Usa las mismas categorías que el changelog: Feature, Fix, Refactor, Migración, Documentación o Configuración.
3. Repasa el checklist y marca con `[x]` **solo lo que hayas verificado de verdad**. Si no has hecho algo, déjalo sin marcar.
4. Si un punto del checklist no aplica (por ejemplo, no hay nada que probar en local para un cambio puramente de markdown), indícalo explícitamente en la descripción del PR en lugar de marcarlo a ciegas o dejarlo en silencio.

El checklist no es burocracia: es el último filtro para que documentación, changelog, pruebas y revisión de seguridad no se queden a medias cuando hay prisa por mergear.

---

## Registro de mejoras pendientes

Las ideas de mejora que no entran en el sprint actual se anotan en `mejoras/`.

Usa `/mejora` para añadir una entrada al backlog sin interrumpir el flujo de trabajo.

**Formato sugerido:** un archivo Markdown por área temática o un único `mejoras/backlog.md`.
**Contenido mínimo por idea:** título, descripción breve, motivación, prioridad estimada.

Si la carpeta `mejoras/` no existe, créala.

---

## Notas adicionales

<!-- Cualquier otra instrucción específica del proyecto que no encaje en las secciones anteriores.
     Ejemplos: credenciales de entorno necesarias, comandos de desarrollo, quirks conocidos del stack. -->
