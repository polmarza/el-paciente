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

### [MEJORA-02] Que el historial clínico crezca en pantallas altas
**Área:** Frontend
**Prioridad estimada:** Media
**Origen:** Revisión visual a 1920×1080

El diseño fija el historial en 150px. En un proyector 1080p sobra espacio y queda un hueco
vacío grande entre las regiones y el log. Dejar que el historial crezca llenaría ese hueco
con más ediciones visibles, que es justo donde está el drama. Es cambiar un `flex-basis`,
pero conviene consultarlo con el diseño antes.
