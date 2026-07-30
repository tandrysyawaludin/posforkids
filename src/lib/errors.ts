const FRIENDLY_ERRORS: Record<string, string> = {
  setup:
    "🧑‍💼 Ask a grown-up to connect Supabase in Vercel (one click!), then try again.",
  database:
    "🧑‍💼 Ask a grown-up to run the database setup in Supabase, then try again.",
  generic: "😅 Oops! Something went wrong. Try again!",
};

export function friendlyError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (
    lower.includes("missing env") ||
    lower.includes("not configured") ||
    lower.includes("supabase environment")
  ) {
    return FRIENDLY_ERRORS.setup;
  }

  if (
    lower.includes("relation") ||
    lower.includes("does not exist") ||
    lower.includes("password_hash")
  ) {
    return FRIENDLY_ERRORS.database;
  }

  if (lower.includes("please enter your name")) {
    return message;
  }

  return FRIENDLY_ERRORS.generic;
}
