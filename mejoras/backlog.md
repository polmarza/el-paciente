# Backlog de mejoras

Ideas de mejora que no entran en el sprint actual pero que no queremos perder.
No es un compromiso, es un repositorio de ideas.

---

## Formato de entrada

```
### [MEJORA-XX] Título de la idea
**Área:** Frontend / Backend / UX / Infraestructura / Negocio
**Prioridad estimada:** Alta / Media / Baja
**Origen:** De dónde salió la idea (conversación, feedback de usuario, etc.)

Descripción breve de la mejora y por qué aportaría valor.
```

---

### [MEJORA-04] Chat de voz para el pasillo
**Área:** Frontend / Infraestructura
**Prioridad estimada:** Baja (post-hackathon)
**Origen:** Feedback de mentoría del 8/8

Portal no puede: sus mensajes son texto de ≤2KB y los tipos de media están "reservados,
rechazados en v1" (verificado en los tipos del SDK). Haría falta WebRTC (LiveKit, Daily…),
que es otra integración y otra cuenta.

Pero la razón de aplazarlo es de producto: la voz vaciaría el pasillo, y el pasillo existe
para que la deliberación sea VISIBLE — en la demo es lo que demuestra que hay multitud
coordinándose. Si algún día se hace, que la voz conviva con el texto, no que lo sustituya.

### [MEJORA-01] Simplificar el anti-suplantación usando la API REST de Portal
**Área:** Infraestructura
**Prioridad estimada:** Baja
**Origen:** Prueba de humo del 2026-08-08, al descubrir el endpoint REST de publicación

Hoy el agente firma sus mensajes con `AGENT_SECRET` dentro del propio contenido y el
middleware lo verifica y lo elimina con `mask`. Funciona y está verificado, pero existe
`POST /v1/channels/{id}/messages` autenticada con la secret key: si el contexto del
middleware permitiera distinguir una publicación autenticada con `sk_`, el secreto en el
payload sobraría y desaparecería el riesgo de que un `mask` mal escrito lo filtre.

Requiere investigar qué expone `ctx` sobre el origen de la publicación. No tocar antes del
hackathon: lo que hay está probado.

### [MEJORA-02] ~~Que el historial clínico crezca en pantallas altas~~ — RESUELTA (8/8)
**Área:** Frontend
**Origen:** Revisión visual a 1920×1080

Resuelta por otra vía: el historial dejó de ser una franja fija de 150px y pasó a ser un
cajón arrastrable que el espectador abre a la altura que quiera y que pasa por encima de la
mesa de operaciones. Se queda aquí como registro, no como pendiente.

### [MEJORA-05] Modo claro
**Área:** Frontend / UX
**Prioridad estimada:** Baja (post-hackathon)
**Origen:** Pregunta del usuario, 8/8

Hoy la interfaz es solo oscura y no reacciona a `prefers-color-scheme`.

**Por qué no se hizo antes del hackathon.** No es coste: es que el negro no es "un tema",
es el quirófano. Hay piezas que no sobreviven a la traducción a claro y habría que
rediseñarlas, no recolorearlas — el electro verde sobre blanco deja de leerse como monitor
médico; el destello ámbar al intervenir una región (`slotFlash`) funciona porque brilla en
penumbra; y la voz del paciente se distingue del resto con un fondo cálido casi transparente
(`rgba(240,226,208,.045)`) que sobre blanco desaparece. El favicon y la `og-image` también
son oscuros. El argumento de peso a favor es de accesibilidad real (a algunas personas el
texto claro sobre fondo oscuro les produce halo), y precisamente por eso no vale hacerlo
mal deprisa.

**Cómo hacerlo, si se hace.** Lo mecánico es más barato de lo que parece. Hay 236 usos de
`T.x` en 13 ficheros, pero si `theme.ts` pasa a devolver `var(--t-xxx)` en vez de hex, esos
236 usos **no se tocan**: React acepta `var()` en estilos inline. El trabajo real está en:

- Las **6 interpolaciones con sufijo alfa** — `` `${T.vital}1c` ``, `` `${T.amber}1c` ``,
  `` `${T.vital}66` ``, `` `${T.vital}14` ``, `` `${T.online}12` `` — repartidas por
  `Monitor.tsx` y `Onboarding.tsx`. Con `var()` son inválidas; hay que convertirlas en
  tokens propios.
- Los **~20 colores a pelo** en componentes: overlays de `RoundOverlay`/`Onboarding`, las
  sombras de `EditLog`/`Toast`, el rayado del cooldown en `BrainSlot`, el `#dff0ee` de los
  inputs, el aviso de desconexión en `App.tsx` y la pantalla de error de `main.tsx`.
- Los **9 colores** de `styles.css` (fondo, enlaces, scrollbar, `slotFlash`, foco).
- **`lib/diploma.ts`**: dibuja el parte descargable en canvas, y el canvas no resuelve
  `var()`. Necesita valores reales — vía `getComputedStyle` sobre el root, o una paleta JS
  paralela que se mantenga en sincronía.

Luego queda lo que de verdad cuesta: calibrar la paleta clara entera y decidir qué hacer con
las piezas del primer párrafo.
