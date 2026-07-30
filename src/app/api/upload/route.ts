import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { uploadImage, type StorageBucket } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as StorageBucket) || "items";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (bucket !== "avatars" && bucket !== "items") {
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    }

    const url = await uploadImage(bucket, user.id, file);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
