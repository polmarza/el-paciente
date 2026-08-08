/**
 * Preferencias de disposición de la sala. Por ahora solo una: si el pasillo está plegado.
 *
 * Se recuerda entre visitas a propósito. Quien lo pliega es porque quiere la pantalla en
 * dos columnas, y tener que volver a plegarlo en cada recarga sería tratarlo como un
 * accidente en vez de como una decisión.
 */

const PASILLO_KEY = "el-paciente:pasillo-plegado";

export function pasilloCollapsed(): boolean {
  try {
    return localStorage.getItem(PASILLO_KEY) === "1";
  } catch {
    return false;
  }
}

export function setPasilloCollapsed(value: boolean): void {
  try {
    localStorage.setItem(PASILLO_KEY, value ? "1" : "0");
  } catch {
    // Sin persistencia dura la sesión, que ya sirve.
  }
}
