# El agente arranca: imports .ts en el paquete compartido

**Fecha:** 2026-08-08 04:38
**Tipo:** Fix

## Qué se hizo

`pnpm agent` fallaba nada más arrancar con `ERR_MODULE_NOT_FOUND` buscando
`packages/shared/src/types.js`.

Causa: los imports internos de `packages/shared` usaban la extensión `.js` (la convención de
TypeScript compilado a ESM). El agente ejecuta TypeScript directamente con el despojado de
tipos de Node, que resuelve las rutas **literalmente** y no traduce `.js` → `.ts`. El
typecheck no lo detectaba porque TypeScript sí hace esa traducción con
`moduleResolution: bundler`, así que el error solo aparecía al ejecutar.

- Imports internos de `packages/shared` cambiados a `.ts`.
- `allowImportingTsExtensions` añadido a `tsconfig.base.json` para que el typecheck lo acepte.

Verificado después del cambio: 11 tests en verde, typecheck limpio en los tres proyectos,
build de la web correcta, y el agente arranca, se conecta y responde. Su primera respuesta
real citó por su nombre a quienes le habían editado y entró en episodio de crisis, que es
exactamente el comportamiento buscado.

## Qué se modificó

- `packages/shared/src/*.ts` (extensiones de import)
- `tsconfig.base.json`

## Por qué

Sin esto no había agente, y sin agente EL PACIENTE no responde: la sala funcionaba pero
estaba vacía. Es el fallo que solo aparece ejecutando, no compilando.

## Medición asociada

Con el agente en marcha, un turno completo tarda **13,4 s** de punta a punta: 3,5 s de red y
9,9 s de tecleo en el cliente, porque el modelo agota los 220 tokens y escribe unos 700
caracteres. Acotando la salida a 70 tokens con una instrucción dura de brevedad, el mismo
turno baja a **3,9 s**. El cuello de botella es la longitud de la respuesta, no el proveedor.
