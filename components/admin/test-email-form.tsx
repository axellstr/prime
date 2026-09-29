"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sendTestEmail } from "@/lib/admin/actions"

export function TestEmailForm({
  kind,
  locale,
  defaultTo,
}: {
  kind: string
  locale: string
  defaultTo: string
}) {
  const [state, action, pending] = useActionState(sendTestEmail, {
    error: null,
  })

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="locale" value={locale} />
      <Input
        name="to"
        type="email"
        defaultValue={defaultTo}
        aria-label="Send test to"
        className="w-64 bg-background"
      />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Sending…" : "Send test"}
      </Button>
      {state.sent && <span className="text-sm">Sent.</span>}
      {state.error && (
        <span className="text-sm text-destructive">{state.error}</span>
      )}
    </form>
  )
}
