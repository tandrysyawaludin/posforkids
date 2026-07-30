import { createClient } from "@supabase/supabase-js";
import { assertDeployEnv, getSupabaseServiceKey, getSupabaseUrl } from "./env";

export function getSupabaseAdmin() {
  assertDeployEnv();

  const supabaseUrl = getSupabaseUrl()!;
  const supabaseServiceKey = getSupabaseServiceKey()!;

  return createClient(supabaseUrl, supabaseServiceKey);
}
