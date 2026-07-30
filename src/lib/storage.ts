import sharp from "sharp";
import { getSupabaseAdmin } from "./supabase";

export const STORAGE_BUCKETS = {
  avatars: "avatars",
  items: "items",
} as const;

export type StorageBucket = keyof typeof STORAGE_BUCKETS;

export async function uploadImage(
  bucket: StorageBucket,
  userId: string,
  file: File,
  filename?: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const buffer = Buffer.from(await file.arrayBuffer());
  const maxSize = bucket === "avatars" ? 400 : 800;

  const optimized = await sharp(buffer)
    .rotate()
    .resize(maxSize, maxSize, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();

  const path = `${userId}/${filename || `${Date.now()}.jpg`}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .upload(path, optimized, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .getPublicUrl(path);

  return data.publicUrl;
}
