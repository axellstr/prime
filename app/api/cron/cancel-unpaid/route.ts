import { timingSafeEqual } from "node:crypto"
import { revalidateTag } from "next/cache"

import { sendOrderEmail } from "@/lib/notifications"
import { UNPAID_CANCEL_DAYS } from "@/lib/orders"
import { PRODUCTS_TAG } from "@/lib/products"
import { createAdminClient } from "@/lib/supabase/admin"

/** Daily (vercel.json): cancels orders still awaiting payment after
 *  UNPAID_CANCEL_DAYS, puts their stock back and emails the customer. */
export async function GET(request: Request) {
  if (!authorized(request)) {
    return new Response("Unauthorized", { status: 401 })
  }

  const cutoff = new Date(
    Date.now() - UNPAID_CANCEL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString()
  const db = createAdminClient()
  const { data: orders, error } = await db
    .from("orders")
    .select("id")
    .eq("status", "awaiting_payment")
    .lt("created_at", cutoff)
    .order("created_at")
    .limit(100)
  if (error) {
    console.error("cancel-unpaid: query failed", error)
    return Response.json({ error: "query failed" }, { status: 500 })
  }

  const cancelled: string[] = []
  const failed: string[] = []
  for (const { id } of orders) {
    const { error } = await db.rpc("transition_order", {
      p_order_id: id,
      p_to_status: "cancelled",
      p_actor: "system",
      p_note: `Unpaid after ${UNPAID_CANCEL_DAYS} days`,
    })
    if (error) {
      // Most likely marked as paid in the meantime.
      console.error(`cancel-unpaid: ${id} not cancelled:`, error.message)
      failed.push(id)
      continue
    }
    cancelled.push(id)
    await sendOrderEmail(id, "cancelled", { unpaid: true })
  }

  if (cancelled.length > 0) revalidateTag(PRODUCTS_TAG, "max")
  return Response.json({ cancelled: cancelled.length, failed: failed.length })
}

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const given = Buffer.from(request.headers.get("authorization") ?? "")
  const expected = Buffer.from(`Bearer ${secret}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}
