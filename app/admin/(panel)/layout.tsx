import Link from "next/link"

import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/admin/actions"
import { requireAdmin } from "@/lib/admin/auth"

export default async function PanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin()

  return (
    <>
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <Link href="/admin/orders" className="font-semibold">
            Prime Admin
          </Link>
          <nav className="text-sm text-muted-foreground">
            <Link href="/admin/orders" className="hover:text-foreground">
              Orders
            </Link>
            <Link href="/admin/emails" className="hover:text-foreground">
              Email previews
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">
              {admin.email}
            </span>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  )
}
