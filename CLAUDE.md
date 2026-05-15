# CLAUDE.md

Archivo de referencia para cualquier agente de codificación que trabaje en este proyecto.
Lee este archivo completo antes de hacer cualquier cambio.

## Estado del proyecto y arranque

Antes de hacer cualquier cosa, comprueba el estado del repositorio:

1. Lee todos los archivos de `docs/`
2. Si los documentos están vacíos o incompletos (solo tienen comentarios, sin contenido real):
   - No escribas código
   - No rellenes nada todavía
   - Empieza con esta pregunta: "¿Qué quieres construir y para quién?"
   - A partir de la respuesta, haz las preguntas necesarias para completar 
     los documentos de docs/ en este orden: prd.md → business.md → 
     design-system.md → architecture.md → data-model.md → roadmap.md → user-flows.md
   - Confirma con el usuario antes de pasar al siguiente documento
   - Cuando todos estén rellenos, pregunta: "¿Empezamos a construir?"

3. Si los documentos ya tienen contenido: lee todo lo que haya en `docs/` antes de actuar.

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

### 2. Actualizar la documentación afectada

Si el cambio afecta algo que está documentado en `docs/`, actualiza ese archivo en la misma sesión. No dejes documentación desincronizada.

Ejemplos:
- Nueva tabla en Supabase → actualizar `docs/data-model.md`
- Nuevo componente o patrón visual → actualizar `docs/design-system.md`
- Cambio en la arquitectura de carpetas → actualizar `docs/architecture.md`
- Nueva funcionalidad en scope → actualizar `docs/prd.md` y `docs/roadmap.md`

### 3. Actualizar README.md si aplica

Si el cambio afecta cómo se instala, inicializa o usa el proyecto, actualizar `README.md`.

### 4. Revisión de seguridad

Antes de mergear a producción, o cuando el usuario lo pida, ejecuta `/security-review`.
Analiza los cambios en busca de vulnerabilidades, credenciales expuestas y problemas de seguridad.

---

## Protocolo de pull requests

Cuando el cambio vaya a un pull request, GitHub rellena automáticamente la descripción con la plantilla de `.github/pull_request_template.md`. Antes de dar el trabajo por cerrado:

1. Rellena las secciones `¿Qué se hizo?` y `Motivación` con el contexto real del cambio (no dejarlo en blanco ni con el placeholder).
2. Marca con `[x]` la casilla correcta en `Tipo de cambio`. Usa las mismas categorías que el changelog: Feature, Fix, Refactor, Migración, Documentación o Configuración.
3. Repasa el checklist y marca con `[x]` **solo lo que hayas verificado de verdad**. Si no has hecho algo, déjalo sin marcar.
4. Si un punto del checklist no aplica (por ejemplo, no hay nada que probar en local para un cambio puramente de markdown), indícalo explícitamente en la descripción del PR en lugar de marcarlo a ciegas o dejarlo en silencio.

El checklist no es burocracia: es el último filtro para que documentación, changelog, pruebas y revisión de seguridad no se queden a medias cuando hay prisa por mergear.

Si el PR lo abre el agente directamente, debe rellenar la plantilla completa antes de enviarlo. Si lo abre una persona, el agente debe haber verificado los puntos del checklist antes de cerrar la sesión y reportar el resultado.

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
