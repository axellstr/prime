import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import type { Database } from "./database.types"
import { supabaseAnonKey, supabaseUrl } from "./env"

/** Refreshes the Supabase session cookie and reports whether someone is
 *  signed in. An optimistic check only: pages and actions verify the admin
 *  role themselves (lib/admin/auth.ts). */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    supabaseUrl(),
    supabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Validates the token (and refreshes it when needed). Nothing may run
  // between creating the client and this call.
  const { data } = await supabase.auth.getClaims()

  return { response, signedIn: Boolean(data?.claims) }
}
