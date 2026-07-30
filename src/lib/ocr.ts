import { matchItemCode } from "./matchCode";

function clean(text: string): string {
  return text.replace(/[^A-Za-z0-9]/g, "").toUpperCase().trim();
}

function cropCenter(source: HTMLCanvasElement): HTMLCanvasElement {
  const cropW = Math.floor(source.width * 0.75);
  const cropH = Math.floor(source.height * 0.45);
  const cropX = Math.floor((source.width - cropW) / 2);
  const cropY = Math.floor((source.height - cropH) / 2);

  const cropped = document.createElement("canvas");
  cropped.width = cropW;
  cropped.height = cropH;
  const ctx = cropped.getContext("2d");
  if (!ctx) return source;
  ctx.drawImage(source, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  return cropped;
}

function scaleUp(source: HTMLCanvasElement, factor = 2): HTMLCanvasElement {
  const scaled = document.createElement("canvas");
  scaled.width = source.width * factor;
  scaled.height = source.height * factor;
  const ctx = scaled.getContext("2d");
  if (!ctx) return source;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(source, 0, 0, scaled.width, scaled.height);
  return scaled;
}

function toGrayscaleContrast(source: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext("2d");
  if (!ctx) return source;
  ctx.drawImage(source, 0, 0);
  const imageData = ctx.getImageData(0, 0, out.width, out.height);
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const gray =
      0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const boosted = Math.min(255, Math.max(0, (gray - 80) * 2.2));
    data[i] = boosted;
    data[i + 1] = boosted;
    data[i + 2] = boosted;
  }
  ctx.putImageData(imageData, 0, 0);
  return out;
}

function toBinarize(source: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext("2d");
  if (!ctx) return source;
  ctx.drawImage(source, 0, 0);
  const imageData = ctx.getImageData(0, 0, out.width, out.height);
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const gray =
      0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const v = gray < 128 ? 0 : 255;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
  }
  ctx.putImageData(imageData, 0, 0);
  return out;
}

function buildVariants(canvas: HTMLCanvasElement): HTMLCanvasElement[] {
  const cropped = cropCenter(canvas);
  const big = scaleUp(cropped, 2);
  return [
    big,
    scaleUp(toGrayscaleContrast(cropped), 2),
    scaleUp(toBinarize(cropped), 2),
  ];
}

export interface ScanResult {
  bestText: string;
  matchedCode: string | null;
}

export async function recognizeCode(
  canvas: HTMLCanvasElement,
  knownCodes: string[] = []
): Promise<ScanResult> {
  const Tesseract = (await import("tesseract.js")).default;
  const candidates = new Set<string>();

  for (const variant of buildVariants(canvas)) {
    const { data } = await Tesseract.recognize(variant, "eng", {
      logger: () => {},
    });

    const full = clean(data.text);
    if (full.length >= 2) candidates.add(full);

    for (const part of data.text.split(/\s+/)) {
      const w = clean(part);
      if (w.length >= 2) candidates.add(w);
    }
  }

  // Prefer a candidate that matches a known item code
  for (const c of candidates) {
    const matched = matchItemCode(c, knownCodes);
    if (matched) return { bestText: c, matchedCode: matched };
  }

  // Longest token is usually the intended code
  const sorted = [...candidates].sort((a, b) => b.length - a.length);
  const bestText = sorted[0] ?? "";

  return {
    bestText,
    matchedCode: bestText ? matchItemCode(bestText, knownCodes) : null,
  };
}
