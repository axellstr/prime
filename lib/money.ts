import { useFormatter } from "next-intl"

/** Catalogue prices include German VAT. */
export const VAT_PERCENT = 19

/** VAT contained in a gross amount, in cents. */
export function vatIncluded(grossCents: number) {
  return Math.round((grossCents * VAT_PERCENT) / (100 + VAT_PERCENT))
}

/** Formats integer euro cents for the current locale, e.g. 2990 → "29,90 €". */
export function useFormatCents() {
  const format = useFormatter()
  return (cents: number) =>
    format.number(cents / 100, { style: "currency", currency: "EUR" })
}
