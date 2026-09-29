"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { Resend } from "resend"
import * as z from "zod"

import { requireAdmin } from "@/lib/admin/auth"
import { sampleEmailOrder } from "@/lib/email/order-data"
import { renderOrderEmail } from "@/lib/email/render"
import { sendOrderEmail, type OrderEmail } from "@/lib/notifications"
import { PRODUCTS_TAG } from "@/lib/products"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export type FormState = { error: string | null }

const signInSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  password: z.string().min(1),
})

export async function signIn(
  _previous: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: "Enter your email and password." }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error || !data.user) return { error: "Invalid email or password." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle()
  if (profile?.role !== "admin") {
    await supabase.auth.signOut()
    return { error: "This account does not have admin access." }
  }

  redirect("/admin/orders")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/admin/login")
}

// Moves the admin panel can make, and the email each one sends.
const EMAILS = {
  processing: "paid",
  shipped: "shipped",
  cancelled: "cancelled",
} as const satisfies Record<string, OrderEmail>

const transitionSchema = z.object({
  orderId: z.uuid(),
  to: z.enum(["processing", "shipped", "cancelled"]),
  trackingNumber: z.string().trim().max(64).optional(),
  note: z.string().trim().max(500).optional(),
})

const ERRORS: Record<string, string> = {
  NOT_FOUND: "This order no longer exists.",
  INVALID_TRANSITION:
    "The order has changed in the meantime. Reload the page and try again.",
  TRACKING_REQUIRED: "Enter a tracking number to mark the order as shipped.",
}

/** Mark as paid / shipped / cancelled. Each move is checked and logged in
 *  the database (transition_order) and sends its customer email. */
export async function transitionOrder(
  _previous: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin()

  const parsed = transitionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: "Invalid request." }
  const { orderId, to, trackingNumber, note } = parsed.data

  const { error } = await createAdminClient().rpc("transition_order", {
    p_order_id: orderId,
    p_to_status: to,
    p_actor: `admin:${admin.id}`,
    p_note: note,
    p_tracking_number: trackingNumber,
  })
  if (error) {
    const message = ERRORS[error.message]
    if (!message) console.error("transition_order failed", error)
    return { error: message ?? "Something went wrong. Please try again." }
  }

  // Cancelling puts the stock back.
  if (to === "cancelled") revalidateTag(PRODUCTS_TAG, "max")
  await sendOrderEmail(orderId, EMAILS[to])

  revalidatePath("/admin/orders", "layout")
  return { error: null }
}

const resendSchema = z.object({
  orderId: z.uuid(),
  kind: z.enum(["received", "paid", "shipped", "cancelled"]),
})

/** Sends an order email again, e.g. after a failed attempt. */
export async function resendOrderEmail(
  _previous: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin()
  const parsed = resendSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: "Invalid request." }
  const { orderId, kind } = parsed.data

  // A cancellation by the unpaid-order job explains why.
  let unpaid = false
  if (kind === "cancelled") {
    const { data } = await createAdminClient()
      .from("order_events")
      .select("actor")
      .eq("order_id", orderId)
      .eq("to_status", "cancelled")
      .maybeSingle()
    unpaid = data?.actor === "system"
  }

  const sent = await sendOrderEmail(orderId, kind, { unpaid, resend: true })
  revalidatePath(`/admin/orders/${orderId}`)
  return { error: sent ? null : "Sending failed. See the email log." }
}

const testSchema = z.object({
  to: z.string().trim().pipe(z.email()),
  kind: z.enum(["received", "paid", "shipped", "cancelled"]),
  locale: z.enum(["de", "en"]),
})

/** Sends the sample order email from the preview page to any address. */
export async function sendTestEmail(
  _previous: FormState & { sent?: boolean },
  formData: FormData
): Promise<FormState & { sent?: boolean }> {
  await requireAdmin()
  const parsed = testSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: "Enter a valid email address." }
  const { to, kind, locale } = parsed.data

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from) return { error: "Email is not configured." }

  const { subject, html, text, attachments } = await renderOrderEmail(
    kind,
    sampleEmailOrder(locale)
  )
  const { error } = await new Resend(apiKey).emails.send({
    from,
    to,
    replyTo: process.env.EMAIL_REPLY_TO || undefined,
    subject: `[Test] ${subject}`,
    html,
    text,
    attachments,
  })
  return error ? { error: error.message } : { error: null, sent: true }
}
