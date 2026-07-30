function firstEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
}

export function getSupabaseUrl() {
  return firstEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
}

export function getSupabaseServiceKey() {
  return firstEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEY",
    "SUPABASE_SERVICE_KEY"
  );
}

export function getSessionSecret() {
  return firstEnv(
    "SESSION_SECRET",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEY",
    "SUPABASE_JWT_SECRET"
  );
}

export function assertDeployEnv() {
  const missing: string[] = [];

  if (!getSupabaseUrl()) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!getSupabaseServiceKey()) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing env vars: ${missing.join(", ")}. Add them in Vercel and redeploy.`
    );
  }
}
