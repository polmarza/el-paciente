/**
 * El sonido del quirófano, sintetizado con WebAudio: cero archivos, cero dependencias.
 *
 * Dos fuentes, y solo dos — el sonido funciona por escasez:
 *  - el tecleo de EL PACIENTE mientras escribe (ruido corto filtrado),
 *  - el ping de monitor de hospital cuando alguien le corta (una edición = un latido).
 *
 * Los navegadores bloquean el audio hasta el primer gesto del usuario. Se desbloquea
 * con cualquier gesto (clic o tecla), y el botón ♪ reproduce un ping al reactivar:
 * sirve de confirmación de que el audio funciona en este navegador.
 */

const STORAGE_KEY = "el-paciente:silencio";

type AudioContextCtor = typeof AudioContext;

let ctx: AudioContext | null = null;
let muted = readMuted();

function readMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
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
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
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
  if (muted) return;
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

/**
 * El ping de monitor de constantes: un seno breve con caída exponencial. Sube medio
 * tono cuando el pulso va alto, que es exactamente lo que hacen las máquinas de verdad.
 */
export function monitorPing(highRate = false): void {
  if (muted) return;
  const context = audio();
  if (!context || context.state !== "running") return;

  const oscillator = context.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = highRate ? 990 : 880;

  const gain = context.createGain();
  const now = context.currentTime;
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

  oscillator.connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.3);
}
