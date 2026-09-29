"use client"

import { ArrowRight, ShoppingBag, X } from "lucide-react"
import { useTranslations } from "next-intl"

import { OrderTotals } from "@/components/order-totals"
import { QuantityStepper } from "@/components/quantity-stepper"
import { Link } from "@/i18n/navigation"
import {
  MAX_QUANTITY,
  removeFromCart,
  setQuantity,
  summarizeCart,
  useCartItems,
  useCartReady,
  useCartVariants,
  type CartLine,
} from "@/lib/cart"
import { useFormatCents } from "@/lib/money"

type Summary = ReturnType<typeof summarizeCart>

export function CartView() {
  const t = useTranslations("Cart")
  const ready = useCartReady()
  const items = useCartItems()
  const variants = useCartVariants(items)
  const cart =
    variants.status === "ready" ? summarizeCart(items, variants.variants) : null

  return (
    // The 88px navigation bar overlays the top, so the content is pushed
    // down by that height plus the regular padding.
    <section className="w-full bg-white px-4 pt-[136px] pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[1400px]">
        <p className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 text-4xl leading-[1.05] font-medium tracking-[-0.02em] text-neutral-900 sm:text-5xl md:text-6xl dark:text-white">
          {t("title")}
        </h1>

        {variants.status === "error" ? (
          <p
            role="alert"
            className="mt-10 rounded-2xl bg-neutral-100 px-6 py-10 text-center text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
          >
            {t("loadError")}
          </p>
        ) : !ready || !cart ? (
          <CartSkeleton />
        ) : cart.lines.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px] lg:gap-16">
            <div>
              <p className="border-b border-neutral-200 pb-4 font-mono text-xs tracking-wider text-neutral-500 uppercase tabular-nums dark:border-neutral-800">
                {t("count", { count: cart.count })}
              </p>
              <ul>
                {cart.lines.map((line) => (
                  <CartRow key={line.variantId} line={line} />
                ))}
              </ul>
            </div>

            <CartSummary cart={cart} />
          </div>
        )}
      </div>
    </section>
  )
}

function CartRow({ line }: { line: CartLine }) {
  const t = useTranslations("Cart")
  const formatCents = useFormatCents()
  const { variant } = line
  const { product } = variant

  return (
    <li className="flex gap-4 border-b border-neutral-200 py-5 sm:gap-6 dark:border-neutral-800">
      <Link
        href={`/shop/${product.slug}`}
        tabIndex={-1}
        className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 sm:w-24 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <img
          src={product.imageUrl}
          alt=""
          width={600}
          height={600}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-medium text-neutral-900 dark:text-white">
              <Link
                href={`/shop/${product.slug}`}
                className="hover:underline hover:underline-offset-4"
              >
                {product.name}
              </Link>
            </h2>
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              {variant.label} · {formatCents(variant.priceCents)}
            </p>
            {line.quantity > variant.stock && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {variant.stock === 0
                  ? t("stock.soldOut")
                  : t("stock.limited", { count: variant.stock })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeFromCart(line.variantId)}
            aria-label={t("remove", {
              name: `${product.name} ${variant.label}`,
            })}
            className="-m-2 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <QuantityStepper
            size="sm"
            value={line.quantity}
            onChange={(next) => setQuantity(line.variantId, next)}
            max={Math.max(1, Math.min(variant.stock, MAX_QUANTITY))}
          />
          <p className="text-sm font-medium text-neutral-900 tabular-nums dark:text-white">
            {formatCents(line.totalCents)}
          </p>
        </div>
      </div>
    </li>
  )
}

function CartSummary({ cart }: { cart: Summary }) {
  const t = useTranslations("Cart")

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl bg-neutral-100 p-6 sm:p-8 dark:bg-neutral-900">
        <h2 className="text-lg font-medium tracking-tight text-neutral-900 dark:text-white">
          {t("summary.title")}
        </h2>

        <div className="mt-6">
          <OrderTotals {...cart} />
        </div>

        {cart.hasStockIssue ? (
          <>
            <button
              type="button"
              disabled
              className="mt-6 flex h-12 w-full cursor-not-allowed items-center justify-center rounded-xl bg-neutral-900 text-sm font-medium text-white opacity-40 dark:bg-white dark:text-neutral-900"
            >
              {t("summary.checkout")}
            </button>
            <p className="mt-3 text-center text-xs text-red-600 dark:text-red-400">
              {t("summary.fixStock")}
            </p>
          </>
        ) : (
          <Link
            href="/checkout"
            className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
          >
            {t("summary.checkout")}
          </Link>
        )}
      </div>

      <Link
        href="/shop"
        className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
      >
        {t("continue")}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>

      <p className="mt-6 text-xs leading-relaxed text-neutral-500">
        {t("ruoNotice")}
      </p>
    </aside>
  )
}

function EmptyCart() {
  const t = useTranslations("Cart")

  return (
    <div className="mt-10 flex flex-col items-center gap-5 rounded-2xl bg-neutral-100 px-6 py-20 text-center dark:bg-neutral-900">
      <ShoppingBag className="h-8 w-8 text-neutral-400" />
      <div>
        <p className="text-lg font-medium text-neutral-900 dark:text-white">
          {t("empty.title")}
        </p>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {t("empty.body")}
        </p>
      </div>
      <Link
        href="/shop"
        className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-7 py-3.5 font-mono text-[11px] font-medium tracking-[0.12em] text-white uppercase hover:bg-neutral-800 sm:text-xs dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {t("empty.cta")}
      </Link>
    </div>
  )
}

function CartSkeleton() {
  return (
    <div
      aria-hidden
      className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px] lg:gap-16"
    >
      <div className="space-y-5">
        {[0, 1].map((index) => (
          <div key={index} className="flex gap-6">
            <div className="aspect-[3/4] w-24 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-900" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-4 w-40 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-900" />
    </div>
  )
}
