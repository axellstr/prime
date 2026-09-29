import { useTranslations } from "next-intl"

import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/products"

export function Ecommerce9({ products }: { products: Product[] }) {
  const t = useTranslations("Products")

  return (
    <section className="w-full bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[1400px]">
        <h2 className="max-w-2xl text-2xl leading-tight font-semibold tracking-tight text-balance text-neutral-900 sm:text-3xl md:text-4xl dark:text-white">
          {t("title")}
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Ecommerce9
