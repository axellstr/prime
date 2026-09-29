import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { connection } from "next/server"
import { useTranslations } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import * as z from "zod"

import { Footer5 } from "@/components/blocks/footer-5"
import { Navigation7 } from "@/components/blocks/navigation-7"
import { PaymentInstructions } from "@/components/payment-instructions"
import { Link } from "@/i18n/navigation"
import { useFormatCents } from "@/lib/money"
import { orderReference } from "@/lib/orders"
import { getPaymentProvider } from "@/lib/payments"
import type { PaymentInstructions as Instructions } from "@/lib/payments/types"
import { createAdminClient } from "@/lib/supabase/admin"

type Params = Promise<{ locale: string; orderId: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Confirmation" })

  // Personal page behind an unguessable link: never index it.
  return { title: t("metaTitle"), robots: { index: false, follow: false } }
}

/** The order id is a random UUID and acts as the customer's access key, so
 *  the page shows only what they need to pay: no address or email. */
async function getOrder(orderId: string) {
  if (!z.uuid().safeParse(orderId).success) return null

  const { data, error } = await createAdminClient()
    .from("orders")
    .select(
      "number, status, payment_method, subtotal_cents, shipping_cents, total_cents, vat_cents, order_items (product_name, variant_label, qty, line_total_cents)"
    )
    .eq("id", orderId)
    .maybeSingle()
  if (error) throw error
  return data
}

type Order = NonNullable<Awaited<ReturnType<typeof getOrder>>>

export default async function ConfirmationPage({ params }: { params: Params }) {
  const { locale, orderId } = await params
  setRequestLocale(locale)
  // Always read the order fresh; its status changes over time.
  await connection()

  const order = await getOrder(orderId)
  if (!order) notFound()

  const reference = orderReference(order.number)
  const instructions =
    order.status === "awaiting_payment"
      ? getPaymentProvider(order.payment_method).instructions({
          reference,
          totalCents: order.total_cents,
        })
      : null

  return (
    <>
      <Navigation7 />
      <main>
        <Confirmation
          order={order}
          reference={reference}
          instructions={instructions}
        />
      </main>
      <Footer5 />
    </>
  )
}

function Confirmation({
  order,
  reference,
  instructions,
}: {
  order: Order
  reference: string
  instructions: Instructions | null
}) {
  const t = useTranslations("Confirmation")
  const totals = useTranslations("Cart.summary")
  const formatCents = useFormatCents()

  return (
    // The 88px navigation bar overlays the top, so the content is pushed
    // down by that height plus the regular padding.
    <section className="w-full bg-white px-4 pt-[136px] pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[1400px]">
        <p className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
          {t("eyebrow", { reference })}
        </p>
        <h1 className="mt-4 text-4xl leading-[1.05] font-medium tracking-[-0.02em] text-neutral-900 sm:text-5xl md:text-6xl dark:text-white">
          {order.status === "awaiting_payment"
            ? t("title")
            : t(`status.${order.status}`)}
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
          {order.status === "awaiting_payment"
            ? t("body", { reference })
            : t("statusBody", { reference })}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_440px] lg:gap-16">
          <div className="space-y-6">
            {instructions && (
              <>
                <PaymentInstructions instructions={instructions} />
                <p className="text-sm text-neutral-500">{t("keepPage")}</p>
              </>
            )}
          </div>

          <aside className="rounded-2xl border border-neutral-200 p-6 sm:p-8 lg:self-start dark:border-neutral-800">
            <h2 className="text-lg font-medium tracking-tight text-neutral-900 dark:text-white">
              {t("summary")}
            </h2>
            <ul className="mt-6 space-y-3 border-b border-neutral-200 pb-6 text-sm dark:border-neutral-800">
              {order.order_items.map((item, index) => (
                <li key={index} className="flex justify-between gap-4">
                  <span className="text-neutral-900 dark:text-white">
                    {item.qty} × {item.product_name}{" "}
                    <span className="text-neutral-500">
                      {item.variant_label}
                    </span>
                  </span>
                  <span className="shrink-0 text-neutral-900 tabular-nums dark:text-white">
                    {formatCents(item.line_total_cents)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-600 dark:text-neutral-400">
                  {totals("subtotal")}
                </dt>
                <dd className="text-neutral-900 tabular-nums dark:text-white">
                  {formatCents(order.subtotal_cents)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-600 dark:text-neutral-400">
                  {totals("shipping")}
                </dt>
                <dd className="text-neutral-900 tabular-nums dark:text-white">
                  {order.shipping_cents === 0
                    ? totals("shippingFree")
                    : formatCents(order.shipping_cents)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-neutral-200 pt-3 font-medium dark:border-neutral-800">
                <dt className="text-neutral-900 dark:text-white">
                  {totals("total")}
                </dt>
                <dd className="text-neutral-900 tabular-nums dark:text-white">
                  {formatCents(order.total_cents)}
                </dd>
              </div>
            </dl>
            <p className="mt-1 text-right text-xs text-neutral-500 tabular-nums">
              {totals("vat", { amount: formatCents(order.vat_cents) })}
            </p>

            <Link
              href="/shop"
              className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {t("continue")}
            </Link>
          </aside>
        </div>
      </div>
    </section>
  )
}
