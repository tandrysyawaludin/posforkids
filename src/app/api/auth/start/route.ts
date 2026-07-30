import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { username } = await request.json();
    const name = username?.trim();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Please enter your name (at least 2 letters)" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const normalized = name.toLowerCase();

    const { data: existing } = await supabase
      .from("users")
      .select("id, username, display_name, avatar_url, created_at")
      .eq("username", normalized)
      .single();

    if (existing) {
      await createSession(existing.id);
      return NextResponse.json({ user: existing });
    }

    const { data, error } = await supabase
      .from("users")
      .insert({
        username: normalized,
        display_name: name,
      })
      .select("id, username, display_name, avatar_url, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await createSession(data.id);
    return NextResponse.json({ user: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
