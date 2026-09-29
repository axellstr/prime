"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { transitionOrder } from "@/lib/admin/actions"
import type { OrderStatus } from "@/components/admin/status-badge"

/** The status moves available for an order, as small separate forms. */
export function OrderActions({
  orderId,
  status,
}: {
  orderId: string
  status: OrderStatus
}) {
  const [state, action, pending] = useActionState(transitionOrder, {
    error: null,
  })

  const canPay = status === "awaiting_payment"
  const canShip = status === "processing"
  const canCancel = status === "awaiting_payment" || status === "processing"

  if (!canPay && !canShip && !canCancel) {
    return (
      <p className="text-sm text-muted-foreground">
        No actions for this status.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      {canPay && (
        <form action={action}>
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="to" value="processing" />
          <Button type="submit" disabled={pending} className="w-full">
            Mark as paid
          </Button>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Moves the order to processing and emails the customer.
          </p>
        </form>
      )}

      {canShip && (
        <form action={action} className="space-y-2">
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="to" value="shipped" />
          <Label htmlFor="trackingNumber">DHL tracking number</Label>
          <Input id="trackingNumber" name="trackingNumber" required />
          <Button type="submit" disabled={pending} className="w-full">
            Mark as shipped
          </Button>
        </form>
      )}

      {canCancel && (
        <form
          action={action}
          onSubmit={(event) => {
            if (
              !window.confirm(
                "Cancel this order and put the items back in stock?"
              )
            ) {
              event.preventDefault()
            }
          }}
          className="space-y-2 border-t pt-5"
        >
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="to" value="cancelled" />
          <Label htmlFor="note">Cancellation note (internal, optional)</Label>
          <Input id="note" name="note" />
          <Button
            type="submit"
            variant="destructive"
            disabled={pending}
            className="w-full"
          >
            Cancel order
          </Button>
        </form>
      )}
    </div>
  )
}
