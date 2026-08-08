# Repositorio en GitHub y esqueleto de credenciales

**Fecha:** 2026-08-08 03:45
**Tipo:** Configuración

## Qué se hizo

- Creado el repositorio público <https://github.com/polmarza/el-paciente> y marcado como
  `origin`. El remote anterior apuntaba a la plantilla (`polmarza/project-template`); se
  eliminó para que el proyecto no arrastre su origen.
- Pusheada la rama `main` con la inicialización del proyecto.
- Documentado el flujo real del CLI de Portal tras verificarlo en la documentación oficial
  (docs.useportal.co/config-cli/deploy-and-secrets): el paquete es `@portalsdk/cli`, no hay
  login interactivo y se autentica con `PORTAL_SECRET` (secret key del proyecto). Se añadió
  esa variable, que faltaba, a `.env.example`.
- Creado `.env.local` (ignorado por git) con las variables vacías y las instrucciones de
  dónde sacar cada credencial.
- Revisado el protocolo de MCPs: `claude mcp list` está vacío y Portal no publica servidor
  MCP oficial, así que no se configura ninguno.

## Qué se modificó

- `.env.example` (nueva variable `PORTAL_SECRET`)
- `.env.local` (nuevo, no versionado)
- `README.md` (tabla de variables + comando de deploy de Portal)
- `docs/architecture.md` (estrategia de despliegue con comandos verificados; MCPs revisados)
- Configuración de remotes de git

## Por qué

Poner el proyecto en GitHub antes de escribir código, y dejar el hueco de credenciales listo
para que Pol las rellene sin que ninguna clave pase por el repositorio.
