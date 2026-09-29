"use server"

import { hasLocale } from "next-intl"
import { revalidateTag } from "next/cache"

import { routing } from "@/i18n/routing"
import {
  cartItemsSchema,
  checkoutSchema,
  type CheckoutField,
} from "@/lib/checkout-schema"
import { ENABLED_PAYMENT_METHODS, type PaymentMethod } from "@/lib/payments"
import { PRODUCTS_TAG } from "@/lib/products"
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  SHIPPING_FLAT_CENTS,
} from "@/lib/shipping"
import { createAdminClient } from "@/lib/supabase/admin"

export type RejectReason =
  "unavailable" | "outOfStock" | "priceChanged" | "invalidCart"

export type CheckoutState =
  | { status: "idle" }
  | { status: "invalid"; fields: CheckoutField[] }
  | { status: "rejected"; reason: RejectReason }
  | { status: "failed" }
  | { status: "success"; orderId: string }

// Messages raised by place_order (supabase/migrations/*_place_order.sql).
const REJECTIONS: Record<string, RejectReason> = {
  UNAVAILABLE: "unavailable",
  OUT_OF_STOCK: "outOfStock",
  PRICE_CHANGED: "priceChanged",
  INVALID_ITEMS: "invalidCart",
}

/** Places a guest order. Prices, stock and the total are checked again in
 *  the database; the customer's cart is only a list of variant ids. */
export async function createOrder(
  _previous: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const fields = checkoutSchema.safeParse(Object.fromEntries(formData))
  if (!fields.success) {
    const invalid = new Set(
      fields.error.issues.map((issue) => issue.path[0] as CheckoutField)
    )
    return { status: "invalid", fields: [...invalid] }
  }

  const locale = formData.get("locale")
  const paymentMethod = formData.get("paymentMethod") as PaymentMethod
  const expectedTotalCents = Number(formData.get("expectedTotalCents"))
  let items
  try {
    items = cartItemsSchema.safeParse(JSON.parse(String(formData.get("items"))))
  } catch {
    return { status: "rejected", reason: "invalidCart" }
  }
  if (
    !items.success ||
    !Number.isInteger(expectedTotalCents) ||
    !hasLocale(routing.locales, locale) ||
    !ENABLED_PAYMENT_METHODS.includes(paymentMethod)
  ) {
    return { status: "rejected", reason: "invalidCart" }
  }

  const { email, name, street, zip, city, country, phone } = fields.data
  const address = { name, street, zip, city, country, phone }

  const { data, error } = await createAdminClient().rpc("place_order", {
    p_email: email,
    p_locale: locale,
    p_payment_method: paymentMethod,
    p_billing: address,
    // One address for now; a separate delivery address can come later.
    p_shipping: address,
    p_items: items.data.map((item) => ({
      variant_id: item.variantId,
      qty: item.quantity,
    })),
    p_expected_total_cents: expectedTotalCents,
    p_shipping_flat_cents: SHIPPING_FLAT_CENTS,
    p_free_shipping_threshold_cents: FREE_SHIPPING_THRESHOLD_CENTS,
  })

  if (error) {
    const reason = REJECTIONS[error.message]
    if (reason) return { status: "rejected", reason }
    console.error("place_order failed", error)
    return { status: "failed" }
  }

  // Stock changed; product pages pick it up on their next visit.
  revalidateTag(PRODUCTS_TAG, "max")

  return { status: "success", orderId: data[0].order_id }
}
