import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { Footer5 } from "@/components/blocks/footer-5"
import { Navigation7 } from "@/components/blocks/navigation-7"
import { ShopCatalog } from "@/components/blocks/shop-catalog"
import { getProducts } from "@/lib/products"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Shop" })

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const products = await getProducts()

  return (
    <>
      <Navigation7 />
      <main>
        <ShopHeader count={products.length} />
        <ShopCatalog products={products} />
      </main>
      <Footer5 />
    </>
  )
}

function ShopHeader({ count }: { count: number }) {
  const t = useTranslations("Shop")

  return (
    // The 88px navigation bar overlays the top, so the content is pushed
    // down by that height plus the regular padding.
    <section className="w-full bg-white px-4 pt-[136px] pb-10 sm:px-6 sm:pb-12 lg:px-8 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="max-w-2xl">
          <p className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
            {t("eyebrow")}
          </p>
          <h1 className="mt-4 text-4xl leading-[1.05] font-medium tracking-[-0.02em] text-neutral-900 sm:text-5xl md:text-6xl dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
            {t("summary", { count })}
          </p>
        </div>
      </div>

      <p className="mx-auto mt-10 w-full max-w-[1400px] text-xs leading-relaxed text-neutral-500">
        {t("ruoNotice")}
      </p>
    </section>
  )
}
