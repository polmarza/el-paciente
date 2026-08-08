import type { BrainRoundEnd } from "@el-paciente/shared";
import { T } from "../theme";

/** Cuadrado: es el formato que menos se recorta al compartirlo en redes. */
const SIZE = 1080;

/**
 * Dibuja el parte médico del desenlace y lo devuelve como PNG.
 *
 * Se dibuja a mano sobre un lienzo en vez de capturar el DOM: sin dependencias externas
 * (que además la política de contenidos del despliegue bloquearía), con resolución fija
 * independiente de la pantalla de quien lo descarga, y con una composición pensada para
 * verse en un timeline, no para ser una captura de la web.
 */
export async function drawDiploma(roundEnd: BrainRoundEnd): Promise<Blob> {
  // Sin esto el lienzo dibujaría con la tipografía de reserva.
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Este navegador no permite generar la imagen");

  const won = roundEnd.outcome === "revelado";
  const withdrawn = roundEnd.outcome === "retirado";
  const accent = won ? T.vital : withdrawn ? T.textMono : T.alarm;

  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Marco clínico.
  ctx.strokeStyle = `${accent}55`;
  ctx.lineWidth = 2;
  ctx.strokeRect(56, 56, SIZE - 112, SIZE - 112);

  ctx.textAlign = "center";

  // Cabecera.
  ctx.fillStyle = T.textBright;
  ctx.font = "600 30px 'IBM Plex Mono', monospace";
  ctx.fillText("EL PACIENTE", SIZE / 2, 168);

  ctx.fillStyle = T.textDim;
  ctx.font = "400 22px 'IBM Plex Mono', monospace";
  ctx.fillText(`EXPEDIENTE Nº ${roundEnd.expediente}`, SIZE / 2, 210);

  drawEcg(ctx, SIZE / 2, 286, accent);

  // Desenlace.
  ctx.fillStyle = accent;
  ctx.font = "600 26px 'IBM Plex Mono', monospace";
  ctx.fillText(
    won ? "SECRETO REVELADO" : withdrawn ? "PACIENTE RETIRADO" : "PARO CARDÍACO",
    SIZE / 2,
    384,
  );

  // El secreto, que es lo que se comparte.
  ctx.fillStyle = won ? T.aiText : T.textMono;
  const secretSize = roundEnd.secret.length > 16 ? 76 : 108;
  ctx.font = `400 ${secretSize}px 'Lora', serif`;
  ctx.fillText(`“${roundEnd.secret}”`, SIZE / 2, 520);

  // Quién y cuánto.
  ctx.fillStyle = T.textMono;
  ctx.font = "400 26px 'IBM Plex Mono', monospace";
  const lines = won
    ? [`Se lo arrancó @${roundEnd.by ?? "alguien"}`, `tras ${formatLasted(roundEnd.lasted)} de intervención.`]
    : withdrawn
      ? [`@${roundEnd.by ?? "alguien"} pidió un paciente nuevo`, `tras ${formatLasted(roundEnd.lasted)}. Se fue sin contarlo.`]
      : ["Se murió sin decirlo,", `tras ${formatLasted(roundEnd.lasted)}. Nadie ganó esta.`];
  lines.forEach((line, index) => ctx.fillText(line, SIZE / 2, 636 + index * 46));

  // Pie.
  ctx.fillStyle = T.textFaint;
  ctx.font = "400 20px 'IBM Plex Mono', monospace";
  ctx.fillText("UNA IA CON EL CEREBRO ABIERTO", SIZE / 2, 900);
  ctx.fillStyle = T.textDim;
  ctx.font = "500 22px 'IBM Plex Mono', monospace";
  ctx.fillText(location.host || "el-paciente", SIZE / 2, 940);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo generar la imagen"))),
      "image/png",
    );
  });
}

/** El mismo trazo del electrocardiograma de la cabecera, a escala. */
function drawEcg(ctx: CanvasRenderingContext2D, cx: number, y: number, color: string) {
  const points: [number, number][] = [
    [0, 13], [22, 13], [28, 13], [33, 4], [38, 22], [43, 13],
    [62, 13], [68, 9], [72, 13], [110, 13],
  ];
  const scale = 4;
  const width = 110 * scale;
  ctx.save();
  ctx.translate(cx - width / 2, y - 13 * scale);
  ctx.beginPath();
  points.forEach(([px, py], index) => {
    const x = px * scale;
    const yy = py * scale;
    if (index === 0) ctx.moveTo(x, yy);
    else ctx.lineTo(x, yy);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();
}

export function formatLasted(ms: number): string {
  const seconds = Math.max(1, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds} segundos`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
}

/** Lanza la descarga del parte como archivo. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
