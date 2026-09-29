// TODO: placeholder values — confirm the real rate and threshold.
/** Flat shipping rate in cents, incl. VAT. */
export const SHIPPING_FLAT_CENTS = 690
/** Orders at or above this subtotal (cents, incl. VAT) ship free. */
export const FREE_SHIPPING_THRESHOLD_CENTS = 10000

/** Countries we ship to (ISO 3166-1 alpha-2). Names come from
 *  Intl.DisplayNames, so they need no translations. */
export const SHIPPING_COUNTRIES = [
  "DE",
  "AT",
  "BE",
  "BG",
  "CY",
  "CZ",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GR",
  "HR",
  "HU",
  "IE",
  "IT",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK",
] as const

export type ShippingCountry = (typeof SHIPPING_COUNTRIES)[number]

export function shippingCents(subtotalCents: number) {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
    ? 0
    : SHIPPING_FLAT_CENTS
}
