/** Unpaid orders are cancelled after this many days (also stated in the
 *  customer-facing texts in messages/*.json). */
export const UNPAID_CANCEL_DAYS = 7

/** Customer-facing order reference, also used as the transfer reference. */
export function orderReference(number: number) {
  return `PRIME-${number}`
}

/** DHL shipment tracking page for a tracking number. */
export function trackingUrl(trackingNumber: string) {
  return `https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=${encodeURIComponent(trackingNumber)}`
}
