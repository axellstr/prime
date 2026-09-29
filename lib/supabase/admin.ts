import "server-only"

import { createClient } from "@supabase/supabase-js"

import type { Database } from "./database.types"
import { supabaseUrl } from "./env"

/** Service-role client: bypasses RLS. Server-only; never expose its results
 *  to the browser without picking the fields first. */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key)
    throw new Error("Missing environment variable SUPABASE_SERVICE_ROLE_KEY")

  return createClient<Database>(supabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
