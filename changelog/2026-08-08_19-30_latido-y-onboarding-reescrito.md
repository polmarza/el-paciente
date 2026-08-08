# El latido del monitor y el onboarding reescrito

**Fecha:** 2026-08-08 19:30
**Tipo:** Feature

## Qué se hizo

### El sonido era la idea equivocada

Se había implementado un ping por cada edición. Lo que hacía falta era el **latido continuo**
del monitor, acompasado al electrocardiograma:

- Lo dispara `Monitor` una vez por ciclo del electro, así que su ritmo **es** el ritmo que
  se ve en pantalla.
- **Acelera con el pulso**: periodo = 2200 ms × 76 / LPM. A 142 LPM late cada 1,18 s. La
  tensión se oye antes de leerse.
- Se reprograma a sí mismo leyendo el periodo de una referencia, en vez de reiniciar un
  intervalo en cada cambio de LPM. Con intervalos, cada cambio cortaba el latido a media
  zancada: medido, oscilaba entre 2304 y 1125 ms. Ahora decelera monótono
  (1818 → 1843 → 1859 → 1880 → 1902) con un único salto en el instante de la edición, que
  es exactamente lo que debe sonar.
- El electro se realinea con cada bip y acelera cambiando su velocidad, no su duración, así
  que conserva la fase.

El ping por edición desaparece: el latido ya cuenta esa historia. En su lugar, una **alarma
doble aguda que suena UNA vez al cruzar a zona roja** — una alarma en bucle es lo único
capaz de arruinar una demo por sí sola.

**El tecleo también suena cuando escribes tú**, en el chat, en el pasillo y al reescribir
una región.

### El onboarding, reescrito entero

Cuatro pasos con títulos planos —Objetivo, Mecánica, Final del juego, ¿Cómo te llamas?— y
layout nuevo: texto a la izquierda, dibujo a la derecha, `1/4` abajo a la izquierda y los
botones abajo a la derecha. Fuera los tabs superiores: el título explica más que una
versalita.

Los textos dejan de ser crípticos. El del objetivo aclara además lo que más malentendidos
causaría: *"Solo cuenta cuando lo dice él: escribirlo tú en el chat no gana la partida."*
Sin esa frase, la gente se pondría a adivinar nombres en el chat y pensaría que está roto.

Los dibujos se rehicieron en vertical (220×257). El del objetivo, que era una metáfora
abstracta, pasa a ser el paciente con el secreto bajo llave y, debajo, el mismo paciente
soltándolo. El del paso del nombre muestra tu firma en el historial clínico, **y se
actualiza según escribes**.

### El reloj contaba desde el principio de los tiempos

`SESIÓN 12:21:52` no era una funcionalidad: era un fallo. Contaba desde el mensaje más
antiguo de la sala. Ahora es `EN QUIRÓFANO` y cuenta **lo que lleva vivo este paciente**: se
reinicia con cada ronda, nunca crece hasta el absurdo, y añade tensión.

### `pnpm reset`

Atajo para reiniciar la partida. Vive en la máquina del anfitrión a propósito: sin
autenticación, un botón de reinicio en el navegador sería el vector de sabotaje perfecto.

## Verificación en vivo

Latido medido espiando la creación de osciladores: 13 bips a 880 Hz cada 2200 ms exactos, y
aceleración a ~1900 ms al subir el pulso a 88 LPM. Onboarding recorrido entero (4 pasos).

## Qué se modificó

- `apps/web/src/lib/sound.ts`, `components/Monitor.tsx`, `components/Onboarding.tsx`
  (reescrito), `App.tsx`, `ChatPane.tsx`, `PasilloPane.tsx`, `BrainSlot.tsx`
- `package.json` (`pnpm reset`)

## Pendiente de tu decisión

Un botón de reinicio **en el navegador** para cuando la sala quede sola en un despliegue
público. La versión segura sería que solo aparezca si la sala lleva parada más de 5 minutos,
para que no se pueda usar contra una partida en marcha.
