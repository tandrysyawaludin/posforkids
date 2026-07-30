export async function preprocessForOcr(canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  // Grayscale + high contrast
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const boosted = gray < 140 ? 0 : 255;
    data[i] = boosted;
    data[i + 1] = boosted;
    data[i + 2] = boosted;
  }

  ctx.putImageData(imageData, 0, 0);

  // Crop center 70% where kids point the code
  const cropW = Math.floor(width * 0.7);
  const cropH = Math.floor(height * 0.5);
  const cropX = Math.floor((width - cropW) / 2);
  const cropY = Math.floor((height - cropH) / 2);

  const cropped = document.createElement("canvas");
  cropped.width = cropW;
  cropped.height = cropH;
  const cropCtx = cropped.getContext("2d");
  if (!cropCtx) return canvas;
  cropCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  // Scale up for better OCR
  const scaled = document.createElement("canvas");
  scaled.width = cropW * 2;
  scaled.height = cropH * 2;
  const scaledCtx = scaled.getContext("2d");
  if (!scaledCtx) return cropped;
  scaledCtx.imageSmoothingEnabled = false;
  scaledCtx.drawImage(cropped, 0, 0, scaled.width, scaled.height);

  return scaled;
}

export async function recognizeCode(canvas: HTMLCanvasElement): Promise<string> {
  const processed = await preprocessForOcr(canvas);
  const Tesseract = (await import("tesseract.js")).default;

  const { data } = await Tesseract.recognize(processed, "eng", {
    logger: () => {},
  });

  return data.text.replace(/[^A-Za-z0-9]/g, "").toUpperCase().trim();
}
