import sharp from "sharp";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "./supabase";
import {
  STORAGE_BUCKETS,
  getImageServeUrl,
  type StorageBucket,
} from "./imageUrl";

export { STORAGE_BUCKETS, type StorageBucket } from "./imageUrl";

function isJpeg(bytes: Uint8Array): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isPng(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  );
}

function isWebp(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

function detectImageType(bytes: Uint8Array, mimeType: string) {
  if (isJpeg(bytes)) return { contentType: "image/jpeg", ext: "jpg" };
  if (isPng(bytes)) return { contentType: "image/png", ext: "png" };
  if (isWebp(bytes)) return { contentType: "image/webp", ext: "webp" };
  if (mimeType.includes("png")) return { contentType: "image/png", ext: "png" };
  if (mimeType.includes("webp")) return { contentType: "image/webp", ext: "webp" };
  return { contentType: "image/jpeg", ext: "jpg" };
}

function isValidImage(bytes: Uint8Array): boolean {
  return isJpeg(bytes) || isPng(bytes) || isWebp(bytes);
}

async function prepareImageBuffer(
  input: Uint8Array,
  bucket: StorageBucket,
  mimeType: string
): Promise<{ buffer: Uint8Array; contentType: string; ext: string }> {
  const maxSize = bucket === "avatars" ? 400 : 800;

  if (isValidImage(input)) {
    try {
      const processed = await sharp(Buffer.from(input), { failOn: "none" })
        .rotate()
        .resize(maxSize, maxSize, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();

      const processedBytes = new Uint8Array(processed);
      if (processedBytes.length > 200 && isJpeg(processedBytes)) {
        return {
          buffer: processedBytes,
          contentType: "image/jpeg",
          ext: "jpg",
        };
      }
    } catch {
      // use original bytes below
    }
  }

  const detected = detectImageType(input, mimeType);
  return { buffer: input, ...detected };
}

export async function uploadImage(
  bucket: StorageBucket,
  userId: string,
  file: File,
  filename?: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const input = new Uint8Array(await file.arrayBuffer());

  if (input.length < 100) {
    throw new Error("Image file is empty or too small");
  }

  if (!isValidImage(input)) {
    throw new Error("File is not a valid image (use JPG, PNG, or WebP)");
  }

  const { buffer, contentType, ext } = await prepareImageBuffer(
    input,
    bucket,
    file.type || "image/jpeg"
  );

  if (buffer.length < 100 || !isValidImage(buffer)) {
    throw new Error("Image processing failed — please try another photo");
  }

  const baseName =
    filename && filename.includes(".")
      ? filename.replace(/\.[^.]+$/, "")
      : filename || randomUUID();

  const path = `${userId}/${baseName}.${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .upload(path, buffer, {
      contentType,
      upsert: true,
      cacheControl: "3600",
    });

  if (error) throw new Error(error.message);

  const { data: downloaded, error: verifyError } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .download(path);

  if (verifyError || !downloaded) {
    throw new Error("Upload verification failed");
  }

  const saved = new Uint8Array(await downloaded.arrayBuffer());
  if (saved.length < 100 || !isValidImage(saved)) {
    await supabase.storage.from(STORAGE_BUCKETS[bucket]).remove([path]);
    throw new Error("Uploaded image was corrupt — please try again");
  }

  return getImageServeUrl(bucket, path);
}
