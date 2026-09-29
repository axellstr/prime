/** The admin panel is English-only, but money and times are German. */
const money = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
})

const dateTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Berlin",
})

export const formatCents = (cents: number) => money.format(cents / 100)

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso))
