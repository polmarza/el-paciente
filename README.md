# [Nombre del proyecto]

<!-- Una frase que explique qué es el proyecto. -->

---

## Qué es esto

<!-- 2-3 párrafos explicando el problema que resuelve y cómo lo resuelve.
     Sin jerga técnica. Pensado para alguien que entra al repositorio por primera vez. -->

---

## Requisitos previos

<!-- Lista de lo que necesitas instalado antes de poder correr el proyecto.
     Ejemplo:
     - Node.js 18+
     - Una cuenta de Supabase
     - Variables de entorno configuradas (ver sección siguiente) -->

---

## Variables de entorno

<!-- Lista de variables necesarias con descripción. Nunca pongas valores reales aquí.
     Ejemplo:
     ```
     NEXT_PUBLIC_SUPABASE_URL=       # URL del proyecto Supabase
     NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Clave pública de Supabase
     SUPABASE_SERVICE_ROLE_KEY=      # Clave privada (solo servidor)
     RESEND_API_KEY=                 # API key de Resend para emails
     ```
     Copia `.env.example` a `.env.local` y rellena los valores. -->

---

## Instalación y desarrollo

```bash
# Clonar el repositorio
git clone [url-del-repo]
cd [nombre-del-proyecto]

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus valores

# Iniciar en modo desarrollo
npm run dev
```

<!-- Añade pasos adicionales si son necesarios: migraciones de base de datos, seed, etc. -->

---

## Estructura del proyecto

<!-- Explica brevemente qué hay en cada carpeta principal.
     No hace falta listar cada archivo, solo las carpetas de primer nivel y su propósito. -->

---

## Cómo contribuir o trabajar en el proyecto

1. Lee `CLAUDE.md` antes de hacer cualquier cambio.
2. Consulta `docs/` para entender las decisiones de diseño y arquitectura.
3. Registra cualquier cambio relevante en `changelog/`.
4. Si tienes ideas de mejora que no entran ahora, añádelas a `mejoras/`.

---

## Preguntas frecuentes

<!-- Añade aquí las dudas que suelen surgir al trabajar con el proyecto.
     Ejemplo:
     **¿Por qué usamos App Router y no Pages Router?**
     Porque el proyecto requiere Server Components para reducir el bundle del cliente.
     
     **¿Cómo añado una nueva tabla en Supabase?**
     Crea una migración en supabase/migrations/ y actualiza docs/data-model.md. -->

---

## Estado del proyecto

<!-- En desarrollo / Beta / Producción -->
<!-- Última actualización: YYYY-MM-DD -->
