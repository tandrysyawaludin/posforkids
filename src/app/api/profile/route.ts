import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { uploadImage } from "@/lib/storage";

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const formData = await request.formData();
    const displayName = formData.get("display_name") as string | null;
    const avatarFile = formData.get("avatar") as File | null;

    const updates: Record<string, string> = {};
    if (displayName) updates.display_name = displayName.trim();

    if (avatarFile && avatarFile.size > 0) {
      updates.avatar_url = await uploadImage(
        "avatars",
        user.id,
        avatarFile,
        "avatar.jpg"
      );
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select("id, username, display_name, avatar_url, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 500 }
    );
  }
}
