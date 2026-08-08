/**
 * Preferencia de pistas. Mismo patrón que el silenciador de sonido: el botón de la
 * cabecera cambia el estado del módulo y el temporizador de App lo consulta al decidir
 * si enseña la pista — sin pasar props por medio.
 *
 * Solo silencia las PISTAS. Los avisos de rechazo (cooldowns, errores) siguen saliendo:
 * son la respuesta a algo que acabas de hacer, no una sugerencia.
 */

const STORAGE_KEY = "el-paciente:sin-pistas";

let disabled = readDisabled();

function readDisabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function hintsDisabled(): boolean {
  return disabled;
}

export function setHintsDisabled(value: boolean): void {
  disabled = value;
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // Sin persistencia dura la sesión, que ya sirve.
  }
}
