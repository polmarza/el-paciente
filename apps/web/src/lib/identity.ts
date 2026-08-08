import { SELF_COLOR, type Identity } from "@el-paciente/shared";

const STORAGE_KEY = "el-paciente:identity";

/** Handles en el registro del diseño: nombres sueltos mezclados con alias de foro. */
const HANDLES = [
  "marta", "rafa", "lucia", "anais", "chispas", "dr_nadie", "bruno", "vera",
  "quique", "nuria", "tato", "sonia", "el_bedel", "mireia", "pacoletti",
  "ojoclinico", "sinnombre", "curioso", "manazas", "enfermera",
] as const;

function randomNickname(): string {
  const handle = HANDLES[Math.floor(Math.random() * HANDLES.length)] ?? "visitante";
  return `${handle}${Math.floor(Math.random() * 90 + 10)}`;
}

/**
 * La identidad local del espectador. Se guarda en localStorage para que al recargar
 * siga siendo el mismo — su rastro en el historial clínico depende de ello.
 * El verde está reservado al propio espectador, como en el diseño ("@tú").
 */
export function loadIdentity(): Identity {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Identity>;
      if (parsed.nickname) return { nickname: parsed.nickname, color: SELF_COLOR };
    }
  } catch {
    // localStorage bloqueado (modo privado): seguimos con identidad efímera.
  }
  const identity: Identity = { nickname: randomNickname(), color: SELF_COLOR };
  saveIdentity(identity);
  return identity;
}

export function saveIdentity(identity: Identity): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nickname: identity.nickname }));
  } catch {
    // Sin persistencia: aceptable, la sesión sigue funcionando.
  }
}

/** Identificador de pestaña. Sirve para descartar los ecos de nuestros propios cursores. */
export const SESSION_ID: string =
  globalThis.crypto?.randomUUID?.() ?? `s${Math.random().toString(36).slice(2)}`;
