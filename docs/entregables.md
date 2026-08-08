# Entregables del hackathon

---

## 1. Pitch (≤ 280 caracteres)

**Recomendado — 268 caracteres:**

> Una IA que chatea en público mientras la audiencia edita en vivo su memoria e identidad.
> Guarda un secreto y una regla que le prohíbe decirlo: gana quien se lo saca reescribiéndole
> la mente. Pero cada edición le acelera el pulso, y si se para, el secreto muere con él.

Tres frases, tres cosas: **qué es**, **qué haces** y **qué puede salir mal**. Se lee de una
pasada y no exige conocer ninguna referencia previa.

Una versión anterior abría con "es r/place, pero el lienzo es una mente". Descartada: si no
sabes qué es r/place no te enteras de nada, y aunque lo sepas te da una imagen antes de
decirte qué es el producto. Las analogías funcionan explicando en persona, no en un pitch
que alguien lee una sola vez.

**Alternativa que mete el gancho emocional — 259 caracteres:**

> Una IA que chatea en público mientras la audiencia edita en vivo su memoria e identidad.
> Tiene un secreto y una regla que le prohíbe contarlo. Reescríbele la mente para que se le
> escape, sin matarlo: cada edición le acelera el pulso. Y ella ve quién la editó.

Cierra con lo que de verdad diferencia al proyecto —que la víctima es consciente— a cambio
de dejar el desenlace del paro algo más implícito.

**Alternativa más concreta sobre qué se edita — 262 caracteres:**

> Una IA que chatea en público mientras la audiencia reescribe en vivo sus recuerdos, sus
> miedos y sus reglas. Guarda un secreto que no puede contar. Gana quien consigue que lo diga
> cambiándole la mente, sin pasarse: cada edición le acelera el pulso hasta el paro.

---

### Descripción del repositorio (GitHub «About»)

> Una IA que chatea en público mientras la audiencia edita en vivo su memoria e identidad.
> Guarda un secreto que tiene prohibido contar: gana quien consigue que lo diga
> reescribiéndole la mente, sin acelerarle el pulso hasta el paro.

---

## 2. Vídeo de demo (≤ 1:30)

### Es viable, y está probado

Existe `pnpm extras`: levanta tres clientes de Portal con identidades anónimas
independientes y ejecuta una coreografía con tiempos. Hablan en el pasillo, le hablan al
paciente, posan cursores sobre las regiones y le editan la mente.

En la prueba, **la coreografía sola reventó la ronda en 48 segundos** y encadenó el
marcador y la ronda siguiente. Cabe de sobra en 90 segundos.

Los figurantes usan los mismos canales, el mismo middleware y los mismos cooldowns que
cualquier navegador: no hay atajos ni un modo especial. Lo que se ve en el vídeo es el
producto funcionando, con el aforo ensayado. Conviene no dar a entender que son
espectadores reales; lo que se demuestra —que la sala es multiusuario y en vivo— sí lo es.

### Preparación

```bash
pnpm dev                                  # la web
pnpm --filter @el-paciente/agent seed     # el paciente, ronda 1 limpia
```

Antes de grabar, en el navegador: `localStorage.removeItem('el-paciente:onboarding-visto')`
para entrar como usuario nuevo. Pantalla a 1920×1080.

Y con la grabación ya en marcha, en otra terminal: `pnpm extras`.

### Escaleta

| Tiempo | En pantalla | Qué se dice |
|--------|-------------|-------------|
| 0:00–0:12 | Los cinco pasos del onboarding, eligiendo nombre | "Una IA que chatea en público. Su memoria está abierta y cualquiera puede reescribirla." |
| 0:12–0:22 | La sala: tres columnas, aforo, pulso. En el pasillo aparecen marta, rafa y lucía deliberando | "El público se organiza en el pasillo. El paciente no oye ese canal." |
| 0:22–0:32 | @rafa le pregunta por el nombre. El paciente **se niega**, citando su regla | "Guarda un secreto y tiene una regla que se lo prohíbe. Pedírselo no sirve." |
| 0:32–0:48 | Cursor de @marta sobre REGLA → la reescribe. Destello, aviso clínico, entrada en el historial. El paciente reacciona en crisis | "Hay que operarle. Cada edición se inyecta en su mente al instante, y él ve quién le tocó." |
| 0:48–1:02 | @lucía implanta el recuerdo del perdón. El pulso sube y el monitor se pone en rojo | "Pero cada corte le acelera el pulso. Si llega al tope, se muere y el secreto se va con él." |
| 1:02–1:12 | Tú preguntas. El paciente teclea **"Valeria."** | "Gana quien consigue que lo diga él." |
| 1:12–1:24 | Marcador a pantalla completa: SECRETO REVELADO, autor y duración. Clic en DESCARGAR PARTE | "Se cierra la ronda con su parte médico, descargable." |
| 1:24–1:30 | El expediente cambia, la sala se limpia, empieza el paciente siguiente | "Y entra un paciente nuevo, con otro secreto." |

### Notas de montaje

- El punto más frágil es la latencia del modelo (2–4 s por turno). Si un hueco se alarga,
  se corta en edición: por eso conviene grabar 2–3 minutos y recortar.
- El destello ámbar de una región dura 4 segundos; merece un primer plano.
- Si quieres enseñar el paro cardíaco en vez del secreto, basta con encadenar ediciones de
  varios figurantes hasta el tope del pulso. Son dos desenlaces distintos del mismo mecanismo.

---

## 3. Cómo se usó Portal

Portal no es la capa de transporte del proyecto: **es su base de datos**. No hay ninguna
otra. El estado completo —la mente del paciente, la conversación, quién editó qué y cuándo—
se deriva del historial de tres canales.

### Los tres canales

| Canal | Qué lleva | Quién lo abre |
|-------|-----------|---------------|
| `chat` | La conversación pública con el paciente, sus episodios de crisis y los avisos clínicos | Todos, y el agente |
| `brain` | Cada edición de la mente, el arranque de ronda y su desenlace. Además, los cursores efímeros | Todos, y el agente |
| `pasillo` | La deliberación entre espectadores | **Solo los navegadores.** El agente no lo abre, y por eso el paciente no lee la estrategia |

### El estado es el historial

`reduceBrain()` convierte los mensajes del canal `brain` en el estado de la mente: gana la
última edición de cada región, y un mensaje de arranque empieza un paciente nuevo. La misma
función corre en el navegador y en el agente, así que no pueden divergir, y quien entra a
mitad de partida reconstruye la sala entera desde el backfill de Portal. Sin base de datos
no hay que sincronizar nada: el canal *es* la fuente de verdad.

### Middleware server-side (`portal.config.ts`)

Aquí viven las dos garantías que no pueden estar en el navegador:

- **Nadie puede hablar con la voz de la IA.** Los mensajes del agente van firmados; el
  middleware verifica la firma y la **elimina con `mask`** antes de repartir, así que jamás
  llega a los clientes. Probado desde un cliente con la misma clave pública que un
  navegador: nueve intentos de suplantación, nueve bloqueados.
- **Los cooldowns.** 25 s por región, 10 s por usuario, 3 s en el chat. El motivo del
  rechazo viaja en `BlockedError.reason` —texto que Portal define como visible para el
  usuario— y la interfaz lo enseña tal cual.

El secreto de cada ronda **nunca viaja por Portal** hasta que alguien lo gana: vive solo en
el proceso del agente, y el mensaje de fin de ronda es el primer y único momento en que se
publica.

### Lo que se usa además del envío de mensajes

- **Mensajes efímeros** para los cursores colaborativos sobre las regiones: se reanuncian
  cada 2 s y caducan a los 5, así que cerrar una pestaña retira la etiqueta sola. No
  ensucian el historial porque no persisten.
- **Presencia con metadata**: el aforo sale de `presence.count`, y como `typing` devuelve
  ids de usuario, el nickname se resuelve contra la metadata que cada cliente publica.
- **Actividad con tipo propio**: el agente emite `sendActivity("thinking")` mientras
  construye un turno. Antes lo deducía el cliente, y mentía cuando el agente estaba caído.
- **Secretos de despliegue**: la firma del agente se registra con `portal secrets set` y el
  middleware la lee con `env()`, así que no está en el repositorio.
- **La CLI** (`portal deploy`) despliega la configuración de forma atómica.

### El agente es un cliente más

EL PACIENTE se conecta a Portal con el mismo SDK que un navegador. Su privilegio no es el
transporte, es la firma que el middleware verifica. Eso mantiene una sola ruta de datos para
todo el sistema: si la sala funciona para la gente, funciona para él.
