"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"

type Product = {
  id: string
  name: string
  spec: string
  /** Price for one piece, in EUR incl. VAT. */
  price: number
  badge?: "new" | "lowStock"
}

// TODO: placeholder catalogue — replace with real products and prices.
const products: Product[] = [
  {
    id: "a",
    name: "Peptide A",
    spec: "5 mg",
    price: 29.9,
    badge: "new",
  },
  { id: "b", name: "Peptide B", spec: "5 mg", price: 34.9 },
  { id: "c", name: "Peptide C", spec: "10 mg", price: 44.9 },
  {
    id: "d",
    name: "Peptide D",
    spec: "2 mg",
    price: 24.9,
    badge: "lowStock",
  },
  { id: "e", name: "Peptide E", spec: "5 mg", price: 39.9 },
  { id: "f", name: "Peptide F", spec: "10 mg", price: 49.9 },
]

export function Ecommerce9() {
  const t = useTranslations("Products")
  const format = useFormatter()
  const [added, setAdded] = useState<Record<string, boolean>>({})

  const eur = (value: number) =>
    format.number(value, { style: "currency", currency: "EUR" })

  return (
    <section className="w-full bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[1400px]">
        <h2 className="max-w-2xl text-2xl leading-tight font-semibold tracking-tight text-balance text-neutral-900 sm:text-3xl md:text-4xl dark:text-white">
          {t("title")}
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="relative flex aspect-[3/4] items-center justify-center p-8 sm:p-10">
                <img
                  src="/pep.webp"
                  alt=""
                  width={600}
                  height={600}
                  className="h-full w-full object-contain"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium tracking-wide text-neutral-700 dark:bg-neutral-950/90 dark:text-neutral-300">
                    {t(`badge.${product.badge}`)}
                  </span>
                )}

                {/* Revealed on hover/focus; always visible on touch screens. */}
                <div className="pointer-events-none absolute inset-x-3 bottom-3 opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100">
                  <button
                    type="button"
                    onClick={() =>
                      setAdded((current) => ({
                        ...current,
                        [product.id]: true,
                      }))
                    }
                    aria-label={t("addAria", { name: product.name })}
                    className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-white"
                  >
                    {added[product.id] ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      t("quickAdd")
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-4 border-t border-neutral-200 px-4 py-4 dark:border-neutral-800">
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-medium text-neutral-900 dark:text-white">
                    {product.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                    {product.spec}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-medium text-neutral-900 tabular-nums dark:text-white">
                  {eur(product.price)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Ecommerce9
