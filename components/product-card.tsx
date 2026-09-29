"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { addToCart } from "@/lib/cart"
import type { Product } from "@/lib/products"

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("Products")
  const format = useFormatter()
  const [added, setAdded] = useState(false)

  // The checkmark is a brief confirmation, so the button can be used again.
  useEffect(() => {
    if (!added) return
    const timeout = setTimeout(() => setAdded(false), 1500)
    return () => clearTimeout(timeout)
  }, [added])

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src="/pep.webp"
          alt=""
          width={600}
          height={600}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium tracking-wide text-neutral-700 dark:bg-neutral-950/90 dark:text-neutral-300">
            {t(`badge.${product.badge}`)}
          </span>
        )}

        {/* Revealed on hover/focus; always visible on touch screens. Sits above
            the stretched product link so it stays its own click target. */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100">
          <button
            type="button"
            onClick={() => {
              addToCart(product.id)
              setAdded(true)
            }}
            aria-label={t("addAria", { name: product.name })}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-white"
          >
            {added ? <Check className="h-4 w-4" /> : t("quickAdd")}
          </button>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-4 border-t border-neutral-200 px-4 py-4 dark:border-neutral-800">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-medium text-neutral-900 dark:text-white">
            {/* Stretched over the whole card so image and text open the page. */}
            <Link
              href={`/shop/${product.slug}`}
              className="after:absolute after:inset-0 after:rounded-2xl focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-neutral-900 dark:focus-visible:after:ring-white"
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
            {product.spec}
          </p>
        </div>
        <p className="shrink-0 text-sm font-medium text-neutral-900 tabular-nums dark:text-white">
          {format.number(product.price, { style: "currency", currency: "EUR" })}
        </p>
      </div>
    </article>
  )
}
