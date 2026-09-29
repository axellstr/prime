"use client"

import { createContext, use, useState } from "react"
import { useTranslations } from "next-intl"

import { QuantityStepper } from "@/components/quantity-stepper"
import { useRouter } from "@/i18n/navigation"
import { addToCart, MAX_QUANTITY } from "@/lib/cart"
import { useFormatCents } from "@/lib/money"
import type { Product, Variant } from "@/lib/products"
import { cn } from "@/lib/utils"

type PurchaseState = {
  product: Product
  variant: Variant
  setVariant: (variant: Variant) => void
  quantity: number
  setQuantity: (quantity: number) => void
  /** Highest quantity the chosen variant allows; 0 when sold out. */
  maxQuantity: number
}

const PurchaseContext = createContext<PurchaseState | null>(null)

function usePurchase() {
  const state = use(PurchaseContext)
  if (!state) throw new Error("Wrap in <ProductPurchaseProvider>")
  return state
}

/** Shares the chosen amount and quantity between the price under the title,
 *  the amount picker and the add-to-cart controls further down the page. */
export function ProductPurchaseProvider({
  product,
  children,
}: {
  product: Product
  children: React.ReactNode
}) {
  const [variant, setVariantState] = useState(
    () =>
      product.variants.find((candidate) => candidate.stock > 0) ??
      product.variants[0]
  )
  const [quantity, setQuantity] = useState(1)
  const maxQuantity = Math.min(variant.stock, MAX_QUANTITY)

  function setVariant(next: Variant) {
    setVariantState(next)
    // Keep the quantity within what the new amount has in stock.
    setQuantity((current) =>
      Math.max(1, Math.min(current, next.stock, MAX_QUANTITY))
    )
  }

  return (
    <PurchaseContext
      value={{
        product,
        variant,
        setVariant,
        quantity,
        setQuantity,
        maxQuantity,
      }}
    >
      {children}
    </PurchaseContext>
  )
}

export function ProductPrice() {
  const t = useTranslations("Product")
  const formatCents = useFormatCents()
  const { variant, quantity } = usePurchase()

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <p
          aria-live="polite"
          className="text-2xl font-medium text-neutral-900 tabular-nums dark:text-white"
        >
          {formatCents(variant.priceCents * quantity)}
        </p>
        <p className="text-sm text-neutral-500">{t("vat")}</p>
      </div>
      {/* Always rendered so changing the quantity does not shift the page. */}
      <p className="mt-1 h-5 text-sm text-neutral-500 tabular-nums">
        {quantity > 1 &&
          t("unitPrice", { quantity, price: formatCents(variant.priceCents) })}
      </p>
    </div>
  )
}

export function VariantPicker() {
  const t = useTranslations("Product")
  const formatCents = useFormatCents()
  const { product, variant: selected, setVariant } = usePurchase()

  return (
    <fieldset>
      <legend className="text-sm font-medium text-neutral-900 dark:text-white">
        {t("amount")}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {product.variants.map((variant) => {
          const soldOut = variant.stock === 0
          const checked = variant.id === selected.id

          return (
            <label
              key={variant.id}
              className={cn(
                "relative flex min-w-24 cursor-pointer flex-col rounded-xl border px-4 py-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-neutral-900 has-[:focus-visible]:ring-offset-2 dark:has-[:focus-visible]:ring-white dark:has-[:focus-visible]:ring-offset-neutral-950",
                checked
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-200 text-neutral-900 hover:border-neutral-400 dark:border-neutral-800 dark:text-white dark:hover:border-neutral-600",
                soldOut && "cursor-not-allowed opacity-50"
              )}
            >
              <input
                type="radio"
                name={`variant-${product.id}`}
                value={variant.id}
                checked={checked}
                disabled={soldOut}
                onChange={() => setVariant(variant)}
                className="sr-only"
              />
              <span className="font-medium">{variant.label}</span>
              <span
                className={cn(
                  "tabular-nums",
                  checked
                    ? "text-white/70 dark:text-neutral-900/70"
                    : "text-neutral-500"
                )}
              >
                {soldOut ? t("soldOut") : formatCents(variant.priceCents)}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export function ProductPurchase() {
  const t = useTranslations("Product")
  const router = useRouter()
  const { variant, quantity, setQuantity, maxQuantity } = usePurchase()
  const soldOut = maxQuantity === 0

  return (
    <div className="flex gap-3">
      <button
        type="button"
        disabled={soldOut}
        onClick={() => {
          addToCart(variant.id, quantity)
          router.push("/cart")
        }}
        className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
      >
        {soldOut ? t("soldOut") : t("addToCart")}
      </button>

      <QuantityStepper
        value={quantity}
        onChange={setQuantity}
        max={Math.max(1, maxQuantity)}
        className="w-32 sm:w-36"
      />
    </div>
  )
}
