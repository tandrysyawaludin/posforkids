import { normalizeCode } from "./utils";

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }
  return matrix[b.length][a.length];
}

export function matchItemCode(
  scanned: string,
  codes: string[]
): string | null {
  const raw = normalizeCode(scanned);
  if (!raw) return null;

  const normalizedCodes = codes.map((c) => normalizeCode(c));

  // Exact match
  const exact = normalizedCodes.find((c) => c === raw);
  if (exact) return exact;

  // Scanned text contains a known code
  const contained = normalizedCodes.find((c) => c.length >= 2 && raw.includes(c));
  if (contained) return contained;

  // Known code contained in scanned text (OCR added extra chars)
  const reverse = normalizedCodes.find((c) => c.length >= 2 && c.includes(raw));
  if (reverse) return reverse;

  // Fuzzy match for handwriting OCR mistakes
  let best: string | null = null;
  let bestDist = Infinity;
  for (const c of normalizedCodes) {
    if (c.length < 2) continue;
    const dist = levenshtein(raw, c);
    const threshold = Math.max(1, Math.floor(c.length * 0.35));
    if (dist <= threshold && dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }

  return best;
}
