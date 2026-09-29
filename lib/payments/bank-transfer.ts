import "server-only"

import type { PaymentProvider } from "./types"

function required(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable ${name}`)
  return value
}

export const bankTransfer: PaymentProvider = {
  method: "bank_transfer",
  instructions: (order) => ({
    method: "bank_transfer",
    iban: required("BANK_IBAN"),
    bic: required("BANK_BIC"),
    holder: required("BANK_HOLDER"),
    reference: order.reference,
    amountCents: order.totalCents,
  }),
}
