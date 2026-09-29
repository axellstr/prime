import "server-only"

import { bankTransfer } from "./bank-transfer"
import type { PaymentMethod, PaymentProvider } from "./types"

export type { PaymentMethod, PaymentProvider } from "./types"

/** Payment methods offered at checkout, in display order. COD and crypto
 *  plug in here once they have a provider. */
const providers: Partial<Record<PaymentMethod, PaymentProvider>> = {
  bank_transfer: bankTransfer,
}

export const ENABLED_PAYMENT_METHODS = Object.keys(providers) as PaymentMethod[]

export function getPaymentProvider(method: PaymentMethod) {
  const provider = providers[method]
  if (!provider) throw new Error(`Payment method ${method} is not enabled`)
  return provider
}
