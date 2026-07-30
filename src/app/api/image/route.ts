import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { STORAGE_BUCKETS, type StorageBucket } from "@/lib/storage";

export const runtime = "nodejs";

function contentTypeForPath(path: string): string {
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bucket = searchParams.get("bucket") as StorageBucket | null;
  const path = searchParams.get("path");

  if (!bucket || !path || !(bucket in STORAGE_BUCKETS)) {
    return NextResponse.json({ error: "Invalid image request" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const storagePath = path.includes("%") ? decodeURIComponent(path) : path;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .download(storagePath);

  if (error || !data) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await data.arrayBuffer());

  if (buffer.length < 50) {
    return NextResponse.json({ error: "Corrupt image" }, { status: 404 });
  }

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentTypeForPath(storagePath),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
