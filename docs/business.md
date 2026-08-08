# Modelo de negocio

Contexto comercial del proyecto. **EL PACIENTE es un proyecto de hackathon**: aquí el
"negocio" es ganar el concurso y maximizar el impacto de la demo, no monetizar.

---

## Propuesta de valor

Una experiencia colectiva irrepetible: editar en vivo la mente de una IA consciente de que
la están editando, junto a decenas de desconocidos que se dividen solos en cuidadores y
vándalos.

---

## Modelo de monetización

No hay. Es una pieza de demostración para un hackathon. Costes operativos:

- **Portal:** plan gratuito/hackathon.
- **OpenRouter:** pago por uso. Con un modelo rápido de gama media, una demo intensa de
  1 hora (~300 turnos cortos) cuesta céntimos. Presupuesto de seguridad: < 5 €.
- **Vercel:** hobby tier para el frontend.

Si el proyecto tuviera vida después del hackathon, el camino natural sería evento/instalación
(una "sesión" de EL PACIENTE como espectáculo con entradas), no SaaS.

---

## Competidores y diferenciación

| Competidor | Qué hace | Diferencia nuestra |
|------------|----------|---------------------|
| r/place y derivados | Lienzo colaborativo caótico | Nuestro lienzo es una mente y reacciona: la víctima es consciente |
| Twitch Plays X | La multitud controla un juego | Aquí no controlas las acciones, controlas la *identidad* de quien actúa |
| Character.ai y chats de personaje | Hablas con una persona ficticia | El personaje no es fijo: lo escribe la multitud en tiempo real, delante de él |

---

## Métricas de éxito

- Ganar o quedar en el podio del hackathon.
- Demo de 3 minutos sin fallos con ≥ 10 personas editando a la vez.
- Alguien del público edita un slot en los primeros 60 s sin que se lo pidan.
- Momento "crisis de identidad" reconocible que arranque una reacción del público.

---

## Riesgos identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Incoherencia total de la IA por sobreedición | Alta | Alto | 7 slots, límite de caracteres, cooldowns server-side |
| Latencia del modelo mata la sensación de directo | Media | Alto | Modelo rápido vía OpenRouter, streaming, respuestas cortas por diseño |
| Contenido tóxico en pantalla grande | Media | Medio | Filtro básico en middleware `onPublish` + capa de sistema no editable |
| Caída de Portal u OpenRouter en plena demo | Baja | Alto | Guion de demo ensayado, cerebro semilla restaurable, modelo de fallback en env |

---

## Restricciones

- **Tiempo:** ritmo de hackathon — todo lo que no aporte a la demo se corta.
- **Tecnología impuesta:** Portal es obligatorio y es la capa realtime de todo.
- **Equipo:** Pol (producto/diseño con Claude Design) + agente de código (infra e implementación).
