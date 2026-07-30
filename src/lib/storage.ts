import sharp from "sharp";
import { getSupabaseAdmin } from "./supabase";
import {
  STORAGE_BUCKETS,
  getImageServeUrl,
  type StorageBucket,
} from "./imageUrl";

export { STORAGE_BUCKETS, type StorageBucket } from "./imageUrl";

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

  return getImageServeUrl(bucket, path);
}
