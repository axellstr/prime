"use client"

import { createContext, use, useState } from "react"
import { useFormatter, useTranslations } from "next-intl"

import { QuantityStepper } from "@/components/quantity-stepper"
import { useRouter } from "@/i18n/navigation"
import { addToCart } from "@/lib/cart"
import type { Product } from "@/lib/products"

type PurchaseState = {
  product: Product
  quantity: number
  setQuantity: (quantity: number) => void
}

const PurchaseContext = createContext<PurchaseState | null>(null)

function usePurchase() {
  const state = use(PurchaseContext)
  if (!state) throw new Error("Wrap in <ProductPurchaseProvider>")
  return state
}

/** Shares the chosen quantity between the price under the title and the
 *  add-to-cart controls further down the page. */
export function ProductPurchaseProvider({
  product,
  children,
}: {
  product: Product
  children: React.ReactNode
}) {
  const [quantity, setQuantity] = useState(1)

  return (
    <PurchaseContext value={{ product, quantity, setQuantity }}>
      {children}
    </PurchaseContext>
  )
}

export function ProductPrice() {
  const t = useTranslations("Product")
  const format = useFormatter()
  const { product, quantity } = usePurchase()
  const eur = (value: number) =>
    format.number(value, { style: "currency", currency: "EUR" })

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <p
          aria-live="polite"
          className="text-2xl font-medium text-neutral-900 tabular-nums dark:text-white"
        >
          {eur(product.price * quantity)}
        </p>
        <p className="text-sm text-neutral-500">{t("vat")}</p>
      </div>
      {/* Always rendered so changing the quantity does not shift the page. */}
      <p className="mt-1 h-5 text-sm text-neutral-500 tabular-nums">
        {quantity > 1 &&
          t("unitPrice", { quantity, price: eur(product.price) })}
      </p>
    </div>
  )
}

export function ProductPurchase() {
  const t = useTranslations("Product")
  const router = useRouter()
  const { product, quantity, setQuantity } = usePurchase()

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => {
          addToCart(product.id, quantity)
          router.push("/cart")
        }}
        className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
      >
        {t("addToCart")}
      </button>

      <QuantityStepper
        value={quantity}
        onChange={setQuantity}
        className="w-32 sm:w-36"
      />
    </div>
  )
}
