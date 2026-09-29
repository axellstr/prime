import "server-only"

import { Resend } from "resend"

import { loadEmailOrder } from "@/lib/email/order-data"
import { renderOrderEmail } from "@/lib/email/render"
import { createAdminClient } from "@/lib/supabase/admin"

export type OrderEmail = "received" | "paid" | "shipped" | "cancelled"

/** Sends the customer email for an order event, in the order's language,
 *  and records the attempt in order_emails. Never throws: a failed email
 *  must not undo the order change that triggered it.
 *
 *  `resend: true` is a manual resend from the admin panel, which skips
 *  Resend's duplicate protection. */
export async function sendOrderEmail(
  orderId: string,
  kind: OrderEmail,
  options: { unpaid?: boolean; resend?: boolean } = {}
) {
  let recipient = ""
  try {
    const order = await loadEmailOrder(orderId)
    recipient = order.email
    const { subject, html, text, attachments } = await renderOrderEmail(
      kind,
      order,
      options
    )

    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.EMAIL_FROM
    if (!apiKey || !from) throw new Error("Email is not configured")

    const { data, error } = await new Resend(apiKey).emails.send(
      {
        from,
        to: recipient,
        replyTo: process.env.EMAIL_REPLY_TO || undefined,
        bcc:
          process.env.EMAIL_ORDER_COPY_TO && kind === "received"
            ? process.env.EMAIL_ORDER_COPY_TO
            : undefined,
        subject,
        html,
        text,
        attachments,
      },
      // Guards against sending the same email twice on a retried request.
      options.resend ? undefined : { idempotencyKey: `${orderId}/${kind}` }
    )
    if (error) throw new Error(error.message)

    await logEmail(orderId, kind, recipient, {
      sent: true,
      providerId: data?.id,
    })
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Order email ${kind} for ${orderId} failed:`, message)
    await logEmail(orderId, kind, recipient, { sent: false, error: message })
    return false
  }
}

async function logEmail(
  orderId: string,
  kind: OrderEmail,
  recipient: string,
  result: { sent: boolean; providerId?: string; error?: string }
) {
  const { error } = await createAdminClient()
    .from("order_emails")
    .insert({
      order_id: orderId,
      kind,
      recipient,
      sent: result.sent,
      provider_id: result.providerId ?? null,
      error: result.error?.slice(0, 500) ?? null,
    })
  if (error) console.error("Could not log order email:", error.message)
}
