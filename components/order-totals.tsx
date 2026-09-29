"use client"

import { useTranslations } from "next-intl"

import { useFormatCents } from "@/lib/money"
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/shipping"

/** Subtotal, shipping, total and contained VAT. Shared by cart and checkout. */
export function OrderTotals({
  subtotalCents,
  shippingCents,
  totalCents,
  vatCents,
}: {
  subtotalCents: number
  shippingCents: number
  totalCents: number
  vatCents: number
}) {
  const t = useTranslations("Cart.summary")
  const formatCents = useFormatCents()

  return (
    <>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-600 dark:text-neutral-400">
            {t("subtotal")}
          </dt>
          <dd className="text-neutral-900 tabular-nums dark:text-white">
            {formatCents(subtotalCents)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-600 dark:text-neutral-400">
            {t("shipping")}
          </dt>
          <dd className="text-neutral-900 tabular-nums dark:text-white">
            {shippingCents === 0
              ? t("shippingFree")
              : formatCents(shippingCents)}
          </dd>
        </div>
      </dl>
      {shippingCents > 0 && (
        <p className="mt-2 text-xs text-neutral-500">
          {t("freeShippingFrom", {
            amount: formatCents(FREE_SHIPPING_THRESHOLD_CENTS),
          })}
        </p>
      )}

      <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <p className="font-medium text-neutral-900 dark:text-white">
          {t("total")}
        </p>
        <p className="text-2xl font-medium text-neutral-900 tabular-nums dark:text-white">
          {formatCents(totalCents)}
        </p>
      </div>
      <p className="mt-1 text-right text-xs text-neutral-500 tabular-nums">
        {t("vat", { amount: formatCents(vatCents) })}
      </p>
    </>
  )
}
