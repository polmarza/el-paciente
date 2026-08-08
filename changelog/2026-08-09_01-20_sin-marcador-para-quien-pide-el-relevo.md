# Quien pide el relevo ya no ve el marcador

**Fecha:** 2026-08-09 01:20
**Tipo:** Fix

## Qué se hizo

Al pulsar "nueva partida" y confirmar, quien la pedía se comía el marcador de fin de ronda
("PACIENTE RETIRADO — @pol pidió un paciente nuevo…"), que le contaba exactamente lo que
acababa de hacer. El marcador tiene sentido para **el resto de la sala**, que se encuentra
un paciente nuevo sin haberlo pedido y merece saber por qué; para quien pulsó el botón es
ruido.

`App.tsx` recuerda en una ref si el relevo lo pediste tú (`askedForRelevo`) y, cuando llega
el `round-end` con `outcome: "retirado"`, lo marca como ya descartado en lugar de abrirlo.
La ref se limpia también cuando la petición no prospera (el agente puede rechazarla), para
no tragarse el marcador de un relevo que pida otra persona más tarde.

Quien pidió el relevo sigue teniendo señal de que ha pasado algo: el aviso del sistema en
el chat ("▲ dr_bisturi pidió un paciente nuevo. Se lo llevan.") y la sala bloqueada durante
el relevo. Lo que desaparece es solo el modal.

De paso, el `aria-label` del marcador solo contemplaba dos desenlaces y anunciaba un
retirado como "Paro cardíaco"; se quedó atrás al añadir el tercero.

## Qué se modificó

- `apps/web/src/App.tsx` — `askedForRelevo`, y los efectos del desenlace consolidados en
  uno solo para que el orden entre "guardar el desenlace" y "descartarlo" no dependa de en
  qué orden corran dos efectos con la misma dependencia.
- `apps/web/src/components/RoundOverlay.tsx` — `aria-label` para los tres desenlaces.

## Por qué

Pedido por el usuario tras verlo en producción. En la misma captura aparecían unas comillas
vacías (`“”`) donde antes iba el secreto: **no era un bug del código desplegado** —el bundle
en producción ya llevaba el condicional, verificado descargándolo y buscando `e.secret&&`—
sino la pestaña del usuario sirviendo una versión cacheada del bundle anterior contra un
agente que ya no manda el secreto. Se resuelve con un recargado forzado.
