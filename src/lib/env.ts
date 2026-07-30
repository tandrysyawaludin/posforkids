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

export function isAppConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceKey());
}

export function assertDeployEnv() {
  if (!isAppConfigured()) {
    throw new Error("SETUP_REQUIRED");
  }
}
