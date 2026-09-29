import "server-only"

import { render } from "@react-email/components"
import { createTranslator } from "next-intl"

import { OrderEmail } from "@/components/emails/order-email"
import { LOGO_CONTENT_ID, LOGO_PNG_BASE64 } from "@/lib/email/logo"
import type { EmailOrder } from "@/lib/email/order-data"
import type { OrderEmail as Kind } from "@/lib/notifications"
import { trackingUrl } from "@/lib/orders"

/** Public base URL of the shop, e.g. https://prime.de (no trailing slash). */
export function siteUrl() {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")
}

/** Subject, HTML and plain-text version of an order email, in the order's
 *  language. */
export async function renderOrderEmail(
  kind: Kind,
  order: EmailOrder,
  options: {
    unpaid?: boolean
    /** Where the logo comes from; defaults to the inline attachment. */
    logoSrc?: string
  } = {}
) {
  const messages = (await import(`@/messages/${order.locale}.json`)).default
  const translator = createTranslator({ locale: order.locale, messages })
  const t = (key: string, values?: Record<string, string>) =>
    // Keys are built at runtime, so they cannot be checked statically.
    (translator as unknown as (k: string, v?: object) => string)(key, values)

  const money = new Intl.NumberFormat(order.locale, {
    style: "currency",
    currency: "EUR",
  })
  // The default locale has no prefix (localePrefix "as-needed").
  const base = siteUrl() + (order.locale === "de" ? "" : `/${order.locale}`)

  const element = (
    <OrderEmail
      kind={kind}
      order={order}
      unpaid={options.unpaid}
      t={t}
      formatCents={(cents) => money.format(cents / 100)}
      links={{
        order: `${base}/checkout/confirmation/${order.id}`,
        shop: `${base}/shop`,
        terms: `${base}/agb`,
        tracking: order.trackingNumber
          ? trackingUrl(order.trackingNumber)
          : null,
      }}
      replyEnabled={Boolean(process.env.EMAIL_REPLY_TO)}
      logoSrc={options.logoSrc ?? `cid:${LOGO_CONTENT_ID}`}
    />
  )

  return {
    subject: t(`Emails.${kind}.subject`, { reference: order.reference }),
    html: await render(element),
    text: await render(element, { plainText: true }),
    attachments: options.logoSrc ? [] : [logoAttachment],
  }
}

/** The logo as an inline image, referenced from the HTML as cid:prime-logo.
 *  Works in every client without the image being hosted anywhere. */
const logoAttachment = {
  filename: "prime-logo.png",
  content: LOGO_PNG_BASE64,
  contentId: LOGO_CONTENT_ID,
}
