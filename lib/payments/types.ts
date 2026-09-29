import type { Database } from "@/lib/supabase/database.types"

export type PaymentMethod = Database["public"]["Enums"]["payment_method"]

/** What the confirmation page needs to know about an order to tell the
 *  customer how to pay. */
export type PayableOrder = {
  reference: string
  totalCents: number
}

/** Shown to the customer after ordering. One variant per payment method;
 *  each has its own renderer in components/payment-instructions.tsx. */
export type PaymentInstructions = {
  method: "bank_transfer"
  iban: string
  bic: string
  holder: string
  reference: string
  amountCents: number
}

export interface PaymentProvider {
  method: PaymentMethod
  /** Server-only: may read secrets such as account details. */
  instructions(order: PayableOrder): PaymentInstructions
}
