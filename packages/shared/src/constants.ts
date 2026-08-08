/** Identificadores de los dos canales de Portal. El estado del proyecto vive aquí. */
export const CHANNEL_CHAT = "chat";
export const CHANNEL_BRAIN = "brain";

/** Límites de longitud. Los aplica el middleware, no solo la UI. */
export const MAX_SLOT_CHARS = 140;
export const MAX_CHAT_CHARS = 280;

/** Cooldowns en milisegundos. Son la mitigación contra la degeneración en incoherencia. */
export const SLOT_COOLDOWN_MS = 25_000;
export const USER_EDIT_COOLDOWN_MS = 10_000;
export const USER_CHAT_COOLDOWN_MS = 3_000;

/** Cuánto dura el destello ámbar de "recién editado" antes de pasar a bloqueado. */
export const FLASH_MS = 4_000;

/**
 * Etiqueta de actividad que emite el agente mientras construye un turno. El público
 * emite "typing" (nativo de Portal); solo EL PACIENTE emite esta, así que distinguirlos
 * por el tipo es suficiente.
 */
export const ACTIVITY_THINKING = "thinking";
/** La actividad caduca sola: se reanuncia mientras el turno siga en vuelo. */
export const THINKING_HEARTBEAT_MS = 2_000;

/** Cuántas ediciones del historial clínico ve la IA en su system prompt. */
export const LOG_WINDOW = 12;
/** Cuántos mensajes de chat entran en el contexto de cada turno. */
export const CHAT_WINDOW = 14;

/** Constantes vitales: pulso en reposo y salto por cada edición recibida. */
export const BPM_RESTING = 76;
export const BPM_PER_EDIT = 16;
export const BPM_MAX = 142;
/** Por encima de este pulso el monitor se pone en rojo. */
export const BPM_ALARM = 95;

/** Cuánto dura el marcador entre una ronda y la siguiente. */
export const ROUND_INTERMISSION_MS = 18_000;
