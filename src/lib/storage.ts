import { getSupabaseAdmin } from "./supabase";

export async function uploadImage(
  bucket: "avatars" | "items",
  userId: string,
  file: File,
  filename?: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${filename || `${Date.now()}.${ext}`}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
