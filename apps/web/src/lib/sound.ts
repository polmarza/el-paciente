/**
 * El sonido del quirófano, sintetizado con WebAudio: cero archivos, cero dependencias.
 *
 * Tres fuentes, y solo tres — el sonido funciona por escasez:
 *  - el LATIDO del monitor, continuo, acompasado al electro y acelerando con el pulso,
 *  - el tecleo (de EL PACIENTE al escribir, y el tuyo al teclear),
 *  - la alarma, una sola vez, al cruzar a zona roja.
 *
 * Los navegadores bloquean el audio hasta el primer gesto del usuario. Se desbloquea
 * con cualquier gesto (clic o tecla), y el botón ♪ reproduce un ping al reactivar:
 * sirve de confirmación de que el audio funciona en este navegador.
 */

const STORAGE_KEY = "el-paciente:silencio";

type AudioContextCtor = typeof AudioContext;

/**
 * El estado vive en `globalThis` a propósito, no en el módulo. Con recarga en caliente
 * conviven varias copias del módulo: la vieja se queda con su propio `muted` y su propio
 * temporizador, así que el latido se duplicaba y el silenciador solo apagaba una de las
 * dos. Compartiendo el estado, cualquier copia obedece al mismo interruptor.
 */
interface EstadoSonido {
  ctx: AudioContext | null;
  muted: boolean;
}
const estado: EstadoSonido = ((globalThis as { __sonidoPaciente?: EstadoSonido })
  .__sonidoPaciente ??= { ctx: null, muted: readMuted() });

function readMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function isMuted(): boolean {
  return estado.muted;
}

export function setMuted(value: boolean): void {
  estado.muted = value;
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // Sin persistencia, el silencio dura la sesión. Suficiente.
  }
  // Al reactivar, un ping de confirmación: si no lo oyes, el problema no es el botón.
  if (!value) monitorPing();
}

function contextCtor(): AudioContextCtor | null {
  if (typeof AudioContext !== "undefined") return AudioContext;
  // Safari antiguo expone la versión con prefijo.
  const legacy = (globalThis as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  return legacy ?? null;
}

function audio(): AudioContext | null {
  const Ctor = contextCtor();
  if (!Ctor) return null;
  if (!estado.ctx) estado.ctx = new Ctor();
  if (estado.ctx.state === "suspended") void estado.ctx.resume();
  return estado.ctx;
}

// Desbloqueo con el primer gesto que haya, del tipo que sea.
if (typeof document !== "undefined") {
  const unlock = () => void audio();
  document.addEventListener("pointerdown", unlock, { passive: true });
  document.addEventListener("keydown", unlock, { passive: true });
}

/**
 * Una pulsación de tecla: un soplo de ruido de 25 ms filtrado en banda. Ligeras
 * variaciones aleatorias de tono y volumen para que no suene a metralleta.
 */
export function keyClick(): void {
  if (estado.muted) return;
  const context = audio();
  if (!context || context.state !== "running") return;

  const length = Math.floor(context.sampleRate * 0.025);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }

  const source = context.createBufferSource();
  source.buffer = buffer;

  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800 + Math.random() * 900;
  filter.Q.value = 1.2;

  const gain = context.createGain();
  gain.gain.value = 0.11 + Math.random() * 0.05;

  source.connect(filter).connect(gain).connect(context.destination);
  source.start();
}

/** Un seno breve con caída exponencial: el "bip" de las máquinas de constantes. */
function beep(frequency: number, peak: number, decay: number, delay = 0): void {
  const context = audio();
  if (!context || context.state !== "running") return;

  const oscillator = context.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  const gain = context.createGain();
  const start = context.currentTime + delay;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + decay);

  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + decay + 0.02);
}

/**
 * El latido del monitor. Lo dispara `Monitor` una vez por ciclo del electro, justo
 * cuando pasa el pico, así que su ritmo ES el ritmo que se ve en pantalla.
 * Sube medio tono en zona roja, como las máquinas de verdad.
 */
export function monitorPing(highRate = false): void {
  if (estado.muted) return;
  beep(highRate ? 990 : 880, 0.18, 0.16);
}

/**
 * La alarma de zona roja: doble bip agudo. Suena UNA vez al cruzar el umbral, no en
 * bucle — una alarma continua es lo único capaz de arruinar una demo por sí sola.
 */
export function alarmBeep(): void {
  if (estado.muted) return;
  beep(1320, 0.2, 0.1);
  beep(1320, 0.2, 0.1, 0.16);
}
