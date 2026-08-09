# Renombrar y pedir paciente nuevo salen del menú móvil a su propio diálogo

**Fecha:** 2026-08-09 02:35
**Tipo:** Fix

## Qué se hizo

En la primera versión del menú ☰ de móvil, las dos acciones que piden algo del usuario se
resolvían dentro del propio desplegable: un campo de texto embebido para el nombre y un
botón que se transformaba en "¿SEGURO?" para la nueva partida. Ambos patrones son
incómodos con el pulgar:

- El menú se cierra al tocar fuera — que es justo lo que haces al ir a por el teclado.
- En un panel de 250px, ni un campo de texto ni una confirmación tienen sitio para
  respirar, y el segundo toque cae peligrosamente cerca de otras filas.

Ahora cada una abre un diálogo propio (`MobileModal`, nuevo): el menú se cierra y la
decisión ocupa la pantalla, con botones de 44px y sin competir con nada. El de renombrar
lleva el campo (autofocus, Enter confirma) y explica para qué sirve el nombre; el de
nueva partida avisa de que la partida se acaba **para todos** los que están en la sala.

De paso, `MenuRow` admite una segunda línea de contexto, que es lo que permite que las
entradas digan qué van a hacer ("Cambiar tu nombre", "Se llevan a este paciente") en vez
de ser etiquetas sueltas.

Verificado a 375×812: menú → los dos diálogos, campo a 16px computados, cancelar cierra
sin efectos, sin scroll horizontal.

## Qué se modificó

- `apps/web/src/components/MobileModal.tsx` (nuevo)
- `apps/web/src/components/BurgerMenu.tsx` — el menú pasa a ser solo una lista; estado de
  diálogo y los dos modales.
- `docs/design-system.md` — apartado Móvil y tabla de componentes.

## Por qué

Pedido por el usuario tras ver la primera versión: "el tema de la confirmación, creo que
la haría fuera del menú, en un modal. Igual que el cambio de nombre".
