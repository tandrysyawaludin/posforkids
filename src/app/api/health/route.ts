import { NextResponse } from "next/server";
import {
  getSessionSecret,
  getSupabaseServiceKey,
  getSupabaseUrl,
} from "@/lib/env";

export async function GET() {
  const checks = {
    supabaseUrl: Boolean(getSupabaseUrl()),
    supabaseServiceKey: Boolean(getSupabaseServiceKey()),
    sessionSecret: Boolean(getSessionSecret()),
  };

  const ok = checks.supabaseUrl && checks.supabaseServiceKey;

  return NextResponse.json(
    {
      ok,
      checks,
      message: ok
        ? "Ready for deployment"
        : "Add Supabase env vars in Vercel and redeploy",
    },
    { status: ok ? 200 : 503 }
  );
}
