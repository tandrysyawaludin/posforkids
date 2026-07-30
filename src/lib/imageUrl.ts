export const STORAGE_BUCKETS = {
  avatars: "avatars",
  items: "items",
} as const;

export type StorageBucket = keyof typeof STORAGE_BUCKETS;

export function getImageServeUrl(bucket: StorageBucket, path: string): string {
  return `/api/image?bucket=${bucket}&path=${encodeURIComponent(path)}`;
}

/** Convert stored URL or path to a displayable URL */
export function resolveImageUrl(
  url: string | null,
  bucket: StorageBucket = "items"
): string | null {
  if (!url) return null;
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  if (url.startsWith("/api/image")) return url;

  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (match) {
    const [, bucketName, path] = match;
    if (bucketName in STORAGE_BUCKETS) {
      return getImageServeUrl(bucketName as StorageBucket, decodeURIComponent(path));
    }
  }

  if (!url.startsWith("http")) {
    return getImageServeUrl(bucket, url);
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith(".supabase.co")) {
      for (const b of Object.keys(STORAGE_BUCKETS)) {
        const parts = parsed.pathname.split(`/public/${b}/`);
        if (parts[1]) {
          return getImageServeUrl(b as StorageBucket, decodeURIComponent(parts[1]));
        }
      }
    }
  } catch {
    return url;
  }

  return url;
}
