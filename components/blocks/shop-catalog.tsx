"use client"

import { useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"

import { ProductCard } from "@/components/product-card"
import { products } from "@/lib/products"
import { cn } from "@/lib/utils"

const sortKeys = ["featured", "priceAsc", "priceDesc"] as const
type SortKey = (typeof sortKeys)[number]

// Sizes on offer, smallest first ("2 mg" before "10 mg").
const sizes = [...new Set(products.map((product) => product.spec))].sort(
  (a, b) => parseFloat(a) - parseFloat(b)
)

export function ShopCatalog() {
  const t = useTranslations("Shop")
  const [size, setSize] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>("featured")

  const visible = useMemo(() => {
    const filtered = size
      ? products.filter((product) => product.spec === size)
      : products
    if (sort === "featured") return filtered
    return [...filtered].sort((a, b) =>
      sort === "priceAsc" ? a.price - b.price : b.price - a.price
    )
  }, [size, sort])

  const chipClass = (active: boolean) =>
    cn(
      "h-9 shrink-0 cursor-pointer rounded-full px-4 text-sm font-medium tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950",
      active
        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
    )

  return (
    <section className="w-full bg-white px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="flex flex-col gap-4 border-y border-neutral-200 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
          <div
            role="group"
            aria-label={t("filter.label")}
            className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
          >
            <button
              type="button"
              aria-pressed={size === null}
              onClick={() => setSize(null)}
              className={chipClass(size === null)}
            >
              {t("filter.all")}
            </button>
            {sizes.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={size === value}
                onClick={() => setSize(value)}
                className={chipClass(size === value)}
              >
                {value}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <p
              aria-live="polite"
              className="font-mono text-xs tracking-wider text-neutral-500 uppercase tabular-nums"
            >
              {t("results", { count: visible.length })}
            </p>
            <div className="relative">
              <label htmlFor="shop-sort" className="sr-only">
                {t("sort.label")}
              </label>
              <select
                id="shop-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className="h-9 cursor-pointer appearance-none rounded-full bg-neutral-100 pr-9 pl-4 text-sm font-medium tracking-tight text-neutral-900 transition-colors hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
              >
                {sortKeys.map((key) => (
                  <option key={key} value={key}>
                    {t(`sort.${key}`)}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-500"
              />
            </div>
          </div>
        </div>

        {visible.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-5">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-neutral-100 px-6 py-20 text-center dark:bg-neutral-900">
            <p className="text-neutral-600 dark:text-neutral-400">
              {t("empty")}
            </p>
            <button
              type="button"
              onClick={() => setSize(null)}
              className={chipClass(true)}
            >
              {t("filter.reset")}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default ShopCatalog
