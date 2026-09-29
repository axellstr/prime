import "server-only"

import { redirect } from "next/navigation"
import { cache } from "react"

import { createClient } from "@/lib/supabase/server"

export type Admin = { id: string; email: string }

/** The signed-in user if they have role 'admin', else null. Checked against
 *  the auth server and the profiles table on every call. */
export const getAdmin = cache(async (): Promise<Admin | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // RLS lets a user read only their own profile row.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle()
  if (profile?.role !== "admin") return null

  return { id: user.id, email: user.email ?? "" }
})

/** Use at the top of every admin page and server action. */
export async function requireAdmin() {
  const admin = await getAdmin()
  if (!admin) redirect("/admin/login")
  return admin
}
