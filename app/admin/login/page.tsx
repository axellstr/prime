import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LoginForm } from "@/components/admin/login-form"
import { getAdmin } from "@/lib/admin/auth"

export const metadata: Metadata = { title: "Sign in" }

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin/orders")

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <LoginForm />
    </main>
  )
}
