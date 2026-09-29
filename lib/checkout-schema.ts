import * as z from "zod"

import { MAX_QUANTITY } from "@/lib/cart-limits"
import { SHIPPING_COUNTRIES } from "@/lib/shipping"

const text = (max: number) => z.string().trim().min(1).max(max)

/** Checkout form fields. Shared by the form (client) and createOrder
 *  (server); the server result is the one that counts. Error messages are
 *  looked up per field in Checkout.errors, so zod's own messages are unused. */
export const checkoutSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  name: text(100),
  street: text(120),
  zip: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/),
  city: text(80),
  country: z.enum(SHIPPING_COUNTRIES),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()/-]{6,20}$/)
    .or(z.literal(""))
    .transform((value) => value || undefined),
  // AGB and Widerrufsbelehrung, accepted with a single checkbox.
  terms: z.literal("on"),
})

export type CheckoutFields = z.input<typeof checkoutSchema>
export type CheckoutField = keyof CheckoutFields

export const cartItemsSchema = z
  .array(
    z.object({
      variantId: z.uuid(),
      quantity: z.number().int().min(1).max(MAX_QUANTITY),
    })
  )
  .min(1)
  .max(50)
  .refine(
    (items) =>
      new Set(items.map((item) => item.variantId)).size === items.length
  )
