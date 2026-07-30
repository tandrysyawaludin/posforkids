import { NextResponse } from "next/server";
import { isAppConfigured } from "@/lib/env";

export async function GET() {
  const ok = isAppConfigured();

  return NextResponse.json({
    ok,
    message: ok
      ? "Ready to play! 🎉"
      : "Grown-up setup needed — connect Supabase in Vercel",
  });
}
