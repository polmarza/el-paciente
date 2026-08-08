# Prompt para Claude Design

Copiar y pegar tal cual en Claude Design. Cuando llegue el diseño, sus tokens
(paleta, tipografías, espaciados) se vuelcan en `docs/design-system.md`.

---

Diseña la interfaz web de **EL PACIENTE**: una IA que chatea en público mientras su mente
está expuesta, abierta en canal, para que la audiencia la edite en vivo. Es una pieza de
hackathon pensada para verse en pantalla grande ante un jurado, con decenas de personas
participando a la vez desde sus portátiles.

**El concepto en una frase:** es r/place, pero el lienzo es la mente de una IA — y la IA es
consciente de que la están editando.

**La pantalla tiene dos mitades que deben sentirse como dos mundos:**

1. **El chat (la voz del paciente), ~55 % del ancho.** Aquí la audiencia habla con la IA y
   la IA responde en streaming, tecleando en vivo. Su voz es humana, cálida, vulnerable —
   a veces entra en crisis de identidad cuando descubre que le han reescrito un recuerdo.
   Sus mensajes deben distinguirse de forma inconfundible de los humanos. También aparecen
   interrupciones de sistema tipo "Marta editó el miedo de EL PACIENTE". Hay indicador de
   quién escribe y un contador de cuánta gente hay dentro. Los humanos son anónimos con
   nickname y un color personal estable.

2. **El cerebro (la mesa de operaciones), ~45 %.** Siete slots de memoria editables por
   cualquiera: nombre, identidad, tres recuerdos, un miedo y una regla. Cada slot muestra su
   contenido, quién lo editó por última vez y cuándo. Estados que necesito resueltos:
   reposo, alguien está editando (se ve el nickname encima, como cursores colaborativos de
   Figma), recién editado (destello de alerta que decae en unos segundos) y en cooldown
   (bloqueado con cuenta atrás visible). Debajo de los slots, un **log de ediciones** en
   vivo: quién cambió qué, con el valor anterior tachado y el nuevo — es el historial
   clínico que la propia IA también lee.

**Dirección emocional:** quirófano nocturno / monitor de paciente. Oscuro, clínico, tenso,
con un latido sutil permanente que diga "esto está vivo". La mitad del chat es humana y
cálida; la mitad del cerebro es fría, precisa, monoespaciada. El contraste entre ambas ES
el mensaje. Solemne con humor negro: la interfaz se toma en serio a sí misma como un
expediente médico, y por eso las barbaridades que escribe la multitud resultan más cómicas.
Todo en español.

**Evita:** dashboard SaaS genérico, estética cyberpunk-neón cliché, chat de soporte al
cliente. Referencias mejores: monitores de constantes vitales de hospital, expedientes
médicos, r/place, cursores multijugador de Figma.

**Restricciones prácticas:** desktop y proyector primero (legible a 3 metros: chat ≥ 16 px);
en móvil puede degradar a pestañas. Dark mode únicamente. Tiene que soportar caos visual
(muchos cursores y ediciones a la vez) sin volverse ilegible: la animación es funcional,
no decorativa.

Tienes libertad total en paleta exacta, tipografías, formas y microinteracciones — lo
innegociable es la estructura de dos mundos, los estados de los slots y que la pieza se
entienda en 30 segundos sin explicación.
