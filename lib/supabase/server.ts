import "server-only"

import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

import type { Database } from "./database.types"
import { supabaseAnonKey, supabaseUrl } from "./env"

/** Acts as the signed-in user (session from cookies). Use for auth. */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Session refresh belongs in proxy.ts (added with the admin panel).
        }
      },
    },
  })
}

/** Anonymous, cookie-free client for public catalogue reads. Touching no
 *  request data keeps pages that use it static. */
export function createPublicClient() {
  return createSupabaseClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
