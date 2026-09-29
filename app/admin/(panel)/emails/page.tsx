import type { Metadata } from "next"
import Link from "next/link"

import { TestEmailForm } from "@/components/admin/test-email-form"
import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/admin/auth"
import { sampleEmailOrder } from "@/lib/email/order-data"
import { renderOrderEmail } from "@/lib/email/render"
import type { OrderEmail } from "@/lib/notifications"

export const metadata: Metadata = { title: "Email previews" }

const KINDS: { kind: OrderEmail; label: string }[] = [
  { kind: "received", label: "Order received" },
  { kind: "paid", label: "Payment received" },
  { kind: "shipped", label: "Shipped" },
  { kind: "cancelled", label: "Cancelled" },
]
const LOCALES = ["de", "en"] as const

type SearchParams = Promise<{ kind?: string; locale?: string; unpaid?: string }>

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const admin = await requireAdmin()
  const params = await searchParams
  const kind = KINDS.find((k) => k.kind === params.kind)?.kind ?? "received"
  const locale = LOCALES.find((l) => l === params.locale) ?? "de"
  const unpaid = kind === "cancelled" && params.unpaid === "1"

  const email = await renderOrderEmail(kind, sampleEmailOrder(locale), {
    unpaid,
    // The preview iframe cannot show inline attachments.
    logoSrc: "/email/prime-logo.png",
  })
  const href = (next: { kind?: string; locale?: string; unpaid?: boolean }) => {
    const search = new URLSearchParams({
      kind: next.kind ?? kind,
      locale: next.locale ?? locale,
    })
    if (next.unpaid) search.set("unpaid", "1")
    return `/admin/emails?${search}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Email previews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customer emails with a sample order. Real emails use the order&apos;s
          data and language.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <Button
            key={k.kind}
            size="sm"
            variant={k.kind === kind && !unpaid ? "default" : "outline"}
            nativeButton={false}
            render={<Link href={href({ kind: k.kind })} />}
          >
            {k.label}
          </Button>
        ))}
        <Button
          size="sm"
          variant={unpaid ? "default" : "outline"}
          nativeButton={false}
          render={<Link href={href({ kind: "cancelled", unpaid: true })} />}
        >
          Cancelled (unpaid)
        </Button>
        <span className="mx-2 border-l" />
        {LOCALES.map((l) => (
          <Button
            key={l}
            size="sm"
            variant={l === locale ? "default" : "outline"}
            nativeButton={false}
            render={<Link href={href({ locale: l, unpaid })} />}
          >
            {l.toUpperCase()}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-sm">
          <span className="text-muted-foreground">Subject:</span>{" "}
          <span className="font-medium">{email.subject}</span>
        </p>
        <TestEmailForm kind={kind} locale={locale} defaultTo={admin.email} />
        <p className="text-xs text-muted-foreground">
          Until your domain is verified in Resend, test emails only reach the
          address your Resend account is registered with.
        </p>
      </div>

      <iframe
        title="Email preview"
        srcDoc={email.html}
        sandbox=""
        className="h-[900px] w-full rounded-lg border bg-background"
      />
    </div>
  )
}
