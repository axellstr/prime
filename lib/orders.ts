/** Customer-facing order reference, also used as the transfer reference. */
export function orderReference(number: number) {
  return `PRIME-${number}`
}
