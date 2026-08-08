import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** El cerrojo vive en la raíz del repo y está en .gitignore. */
const LOCK_PATH = join(dirname(fileURLToPath(import.meta.url)), "../../..", ".agent.lock");

/**
 * Impide que corran dos agentes a la vez.
 *
 * Sin esto el fallo es silencioso y muy caro: cada instancia escucha y responde por su
 * cuenta, así que EL PACIENTE se contesta a sí mismo por duplicado delante del público sin
 * que nada dé error. Durante el desarrollo llegamos a tener tres a la vez sin notarlo.
 */
export function acquireLock(): void {
  const existing = readLock();

  if (existing !== null) {
    if (isAlive(existing)) {
      console.error(
        `\n  Ya hay un EL PACIENTE despierto (proceso ${existing}).\n` +
          `  Dos agentes responden por duplicado, así que este no arranca.\n\n` +
          `  Para detener el otro:  kill ${existing}\n`,
      );
      process.exit(1);
    }
    // El proceso anterior murió sin limpiar (un kill -9, un portátil cerrado).
    console.warn(`Encontrado un cerrojo huérfano del proceso ${existing}. Lo reutilizo.`);
  }

  writeFileSync(LOCK_PATH, String(process.pid), "utf8");

  // `exit` cubre la salida normal y la de `process.exit`; las señales las gestiona index.ts.
  process.on("exit", releaseLock);
}

export function releaseLock(): void {
  if (readLock() === process.pid) rmSync(LOCK_PATH, { force: true });
}

function readLock(): number | null {
  if (!existsSync(LOCK_PATH)) return null;
  const pid = Number.parseInt(readFileSync(LOCK_PATH, "utf8").trim(), 10);
  return Number.isInteger(pid) && pid > 0 ? pid : null;
}

/** La señal 0 no envía nada: solo comprueba que el proceso siga existiendo. */
function isAlive(pid: number): boolean {
  if (pid === process.pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // EPERM significa que existe pero es de otro usuario: sigue estando vivo.
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}
