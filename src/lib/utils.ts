export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function assetUrl(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/vercel-agent";
  if (path.startsWith("http")) return path;
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
