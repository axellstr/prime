"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { resendOrderEmail } from "@/lib/admin/actions"
import type { OrderEmail } from "@/lib/notifications"

export function ResendEmailButton({
  orderId,
  kind,
}: {
  orderId: string
  kind: OrderEmail
}) {
  const [state, action, pending] = useActionState(resendOrderEmail, {
    error: null,
  })

  return (
    <form action={action} className="inline">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="kind" value={kind} />
      <Button type="submit" variant="outline" size="xs" disabled={pending}>
        {pending ? "Sending…" : "Resend"}
      </Button>
      {state.error && (
        <span className="ml-2 text-xs text-destructive">{state.error}</span>
      )}
    </form>
  )
}
