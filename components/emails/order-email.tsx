import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "react-email"

import type { EmailOrder } from "@/lib/email/order-data"
import type { OrderEmail as Kind } from "@/lib/notifications"

type Translate = (key: string, values?: Record<string, string>) => string

export type OrderEmailProps = {
  kind: Kind
  order: EmailOrder
  /** Cancelled for not paying in time (unpaid-order job). */
  unpaid?: boolean
  t: Translate
  formatCents: (cents: number) => string
  links: { order: string; shop: string; terms: string; tracking: string | null }
  replyEnabled: boolean
  /** "cid:…" when sent (inline attachment), a URL in the admin preview. */
  logoSrc: string
}

// Inline styles only: many email clients ignore <style> and classes.
const text = { fontSize: "15px", lineHeight: "24px", color: "#262626" }
const muted = {
  ...text,
  fontSize: "13px",
  lineHeight: "20px",
  color: "#737373",
}
const button = {
  backgroundColor: "#171717",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 600,
  padding: "12px 20px",
  textDecoration: "none",
}
const cell = { ...text, padding: "4px 0" }
const right = {
  ...cell,
  textAlign: "right" as const,
  whiteSpace: "nowrap" as const,
}

export function OrderEmail({
  kind,
  order,
  unpaid = false,
  t,
  formatCents,
  links,
  replyEnabled,
  logoSrc,
}: OrderEmailProps) {
  const reference = { reference: order.reference }
  const name = order.shippingAddress?.name ?? ""

  return (
    <Html lang={order.locale}>
      <Head />
      <Preview>{t(`Emails.${kind}.preview`)}</Preview>
      <Body
        style={{
          backgroundColor: "#f5f5f5",
          fontFamily: "Helvetica, Arial, sans-serif",
          margin: 0,
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            margin: "24px auto",
            maxWidth: "560px",
            padding: "32px 28px",
            borderRadius: "16px",
          }}
        >
          <Img
            src={logoSrc}
            alt={t("Brand.name")}
            width="180"
            height="30"
            style={{ display: "block", border: 0 }}
          />

          <Heading
            as="h1"
            style={{
              fontSize: "24px",
              lineHeight: "30px",
              margin: "28px 0 8px",
              color: "#171717",
            }}
          >
            {t(`Emails.${kind}.title`)}
          </Heading>
          <Text style={muted}>{t("Emails.reference", reference)}</Text>

          {name && <Text style={text}>{t("Emails.greeting", { name })}</Text>}
          <Text style={text}>
            {kind === "cancelled" && unpaid
              ? t("Emails.cancelled.introUnpaid", reference)
              : t(`Emails.${kind}.intro`, reference)}
          </Text>
          {kind === "cancelled" && order.paid && (
            <Text style={text}>{t("Emails.cancelled.refund")}</Text>
          )}

          {kind === "received" && order.payment && (
            <Section
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: "12px",
                padding: "16px 20px",
                margin: "8px 0 16px",
              }}
            >
              <Text style={{ ...text, fontWeight: 600, margin: "0 0 8px" }}>
                {t("Confirmation.bankTransfer.title")}
              </Text>
              {(
                [
                  ["holder", order.payment.holder],
                  ["iban", formatIban(order.payment.iban)],
                  ["bic", order.payment.bic],
                  ["amount", formatCents(order.payment.amountCents)],
                  ["reference", order.payment.reference],
                ] as const
              ).map(([key, value]) => (
                <Text key={key} style={{ ...text, margin: 0 }}>
                  <span style={{ color: "#737373" }}>
                    {t(`Confirmation.bankTransfer.${key}`)}:
                  </span>{" "}
                  <strong>{value}</strong>
                </Text>
              ))}
            </Section>
          )}

          {kind === "shipped" && order.trackingNumber && (
            <Section style={{ margin: "8px 0 16px" }}>
              <Text style={text}>
                {t("Emails.shipped.tracking")}:{" "}
                <strong>{order.trackingNumber}</strong>
              </Text>
              {links.tracking && (
                <Button href={links.tracking} style={button}>
                  {t("Emails.shipped.track")}
                </Button>
              )}
            </Section>
          )}

          {kind === "received" && (
            <Section style={{ margin: "8px 0 16px" }}>
              <Button href={links.order} style={button}>
                {t("Emails.received.viewOrder")}
              </Button>
            </Section>
          )}

          <Hr style={{ borderColor: "#e5e5e5", margin: "24px 0" }} />
          <Text style={{ ...text, fontWeight: 600 }}>
            {t("Emails.orderSummary")}
          </Text>
          <table
            width="100%"
            cellPadding={0}
            cellSpacing={0}
            role="presentation"
          >
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td style={cell}>
                    {item.qty} × {item.name}{" "}
                    <span style={{ color: "#737373" }}>{item.label}</span>
                  </td>
                  <td style={right}>{formatCents(item.totalCents)}</td>
                </tr>
              ))}
              <tr>
                <td style={{ ...cell, paddingTop: "12px" }}>
                  {t("Cart.summary.subtotal")}
                </td>
                <td style={{ ...right, paddingTop: "12px" }}>
                  {formatCents(order.subtotalCents)}
                </td>
              </tr>
              <tr>
                <td style={cell}>{t("Cart.summary.shipping")}</td>
                <td style={right}>
                  {order.shippingCents === 0
                    ? t("Cart.summary.shippingFree")
                    : formatCents(order.shippingCents)}
                </td>
              </tr>
              <tr>
                <td style={{ ...cell, fontWeight: 600 }}>
                  {t("Cart.summary.total")}
                </td>
                <td style={{ ...right, fontWeight: 600 }}>
                  {formatCents(order.totalCents)}
                </td>
              </tr>
            </tbody>
          </table>
          <Text style={{ ...muted, textAlign: "right", marginTop: "4px" }}>
            {t("Cart.summary.vat", { amount: formatCents(order.vatCents) })}
          </Text>

          {order.shippingAddress && kind !== "cancelled" && (
            <>
              <Text style={{ ...text, fontWeight: 600, marginBottom: "4px" }}>
                {t("Emails.deliveryAddress")}
              </Text>
              <Text style={{ ...text, marginTop: 0 }}>
                {order.shippingAddress.name}
                <br />
                {order.shippingAddress.street}
                <br />
                {order.shippingAddress.zip} {order.shippingAddress.city}
                <br />
                {countryName(order.shippingAddress.country, order.locale)}
              </Text>
            </>
          )}

          {kind === "received" && (
            <>
              <Hr style={{ borderColor: "#e5e5e5", margin: "24px 0" }} />
              <Text style={{ ...text, fontWeight: 600 }}>
                {t("Emails.received.legalTitle")}
              </Text>
              {/* TODO: replace with the full Widerrufsbelehrung and model
                  withdrawal form once the legal texts exist. */}
              <Text style={{ ...muted, color: "#b91c1c" }}>
                {t("Emails.received.legalTodo")}
              </Text>
              <Text style={muted}>
                {t("Emails.received.terms")}{" "}
                <Link href={links.terms} style={{ color: "#262626" }}>
                  {links.terms}
                </Link>
              </Text>
            </>
          )}

          {kind === "cancelled" && (
            <Section style={{ margin: "8px 0 16px" }}>
              <Button href={links.shop} style={button}>
                {t("Emails.cancelled.shopAgain")}
              </Button>
            </Section>
          )}

          <Hr style={{ borderColor: "#e5e5e5", margin: "24px 0" }} />
          {replyEnabled && <Text style={text}>{t("Emails.replyHint")}</Text>}
          <Text style={text}>
            {t("Emails.signoff")}
            <br />
            {t("Emails.team")}
          </Text>
          <Text style={muted}>{t("Cart.ruoNotice")}</Text>
        </Container>
      </Body>
    </Html>
  )
}

function formatIban(iban: string) {
  return iban.replace(/\s+/g, "").replace(/(.{4})(?=.)/g, "$1 ")
}

function countryName(code: string, locale: string) {
  return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code
}
