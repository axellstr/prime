import "server-only"

import * as z from "zod"

import { orderReference } from "@/lib/orders"
import { getPaymentProvider } from "@/lib/payments"
import type { PaymentInstructions } from "@/lib/payments/types"
import { createAdminClient } from "@/lib/supabase/admin"

export type EmailLocale = "de" | "en"

const addressSchema = z.object({
  name: z.string(),
  street: z.string(),
  zip: z.string(),
  city: z.string(),
  country: z.string(),
})

export type EmailAddress = z.infer<typeof addressSchema>

/** Everything the order emails show, loaded fresh from the database. */
export type EmailOrder = {
  id: string
  reference: string
  locale: EmailLocale
  email: string
  paid: boolean
  items: { name: string; label: string; qty: number; totalCents: number }[]
  subtotalCents: number
  shippingCents: number
  totalCents: number
  vatCents: number
  shippingAddress: EmailAddress | null
  trackingNumber: string | null
  /** How to pay; only while the order awaits payment. */
  payment: PaymentInstructions | null
}

export async function loadEmailOrder(orderId: string): Promise<EmailOrder> {
  const { data: order, error } = await createAdminClient()
    .from("orders")
    .select(
      "id, number, locale, email, status, payment_method, paid_at, subtotal_cents, shipping_cents, total_cents, vat_cents, shipping, tracking_number, order_items (product_name, variant_label, qty, line_total_cents)"
    )
    .eq("id", orderId)
    .single()
  if (error) throw error

  const reference = orderReference(order.number)
  return {
    id: order.id,
    reference,
    locale: order.locale === "en" ? "en" : "de",
    email: order.email,
    paid: order.paid_at !== null,
    items: order.order_items.map((item) => ({
      name: item.product_name,
      label: item.variant_label,
      qty: item.qty,
      totalCents: item.line_total_cents,
    })),
    subtotalCents: order.subtotal_cents,
    shippingCents: order.shipping_cents,
    totalCents: order.total_cents,
    vatCents: order.vat_cents,
    shippingAddress: addressSchema.safeParse(order.shipping).data ?? null,
    trackingNumber: order.tracking_number,
    payment:
      order.status === "awaiting_payment"
        ? getPaymentProvider(order.payment_method).instructions({
            reference,
            totalCents: order.total_cents,
          })
        : null,
  }
}

/** Made-up order for the admin email preview. */
export function sampleEmailOrder(locale: EmailLocale): EmailOrder {
  return {
    id: "00000000-0000-4000-8000-000000000000",
    reference: orderReference(10042),
    locale,
    email: "customer@example.com",
    paid: true,
    items: [
      { name: "Peptide A", label: "10 mg", qty: 2, totalCents: 10780 },
      { name: "Peptide D", label: "2 mg", qty: 1, totalCents: 2490 },
    ],
    subtotalCents: 13270,
    shippingCents: 0,
    totalCents: 13270,
    vatCents: 2119,
    shippingAddress: {
      name: "Max Mustermann",
      street: "Musterstraße 1",
      zip: "10115",
      city: "Berlin",
      country: "DE",
    },
    trackingNumber: "00340434161094042557",
    payment: {
      method: "bank_transfer",
      iban: "DE00000000000000000000",
      bic: "XXXXDEXXXXX",
      holder: "Prime",
      reference: orderReference(10042),
      amountCents: 13270,
    },
  }
}
