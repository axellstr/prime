import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BadgeCheck, ChevronRight, Package, Truck } from "lucide-react"
import { useTranslations } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { Footer5 } from "@/components/blocks/footer-5"
import { Navigation7 } from "@/components/blocks/navigation-7"
import { ProductCard } from "@/components/product-card"
import { ProductDetails } from "@/components/product-details"
import {
  ProductPrice,
  ProductPurchase,
  ProductPurchaseProvider,
  VariantPicker,
} from "@/components/product-purchase"
import { Link } from "@/i18n/navigation"
import { getProduct, getProducts, type Product } from "@/lib/products"

type Params = Promise<{ locale: string; slug: string }>

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}
  const t = await getTranslations({ locale, namespace: "Product" })

  return {
    title: product.name,
    description: t("description", {
      name: product.name,
      sizes: sizeList(product),
    }),
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const product = await getProduct(slug)
  if (!product) notFound()
  const products = await getProducts()

  return (
    <>
      <Navigation7 />
      <main>
        <ProductDetail product={product} />
        <RelatedProducts product={product} products={products} />
      </main>
      <Footer5 />
    </>
  )
}

/** "5 mg · 10 mg": language-neutral, so shared by both locales. */
function sizeList(product: Product) {
  return product.variants.map((variant) => variant.label).join(" · ")
}

const assurances = [
  { key: "coa", icon: BadgeCheck },
  { key: "dispatch", icon: Package },
  { key: "delivery", icon: Truck },
] as const

function ProductDetail({ product }: { product: Product }) {
  const t = useTranslations("Product")
  const nav = useTranslations("Nav")
  const badges = useTranslations("Products.badge")

  return (
    // The 88px navigation bar overlays the top, so the content is pushed
    // down by that height plus the regular padding.
    <section className="w-full bg-white px-4 pt-[136px] pb-16 sm:px-6 sm:pb-20 lg:px-8 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[1400px]">
        <nav aria-label={t("breadcrumb")}>
          <ol className="flex items-center gap-1.5 font-mono text-xs tracking-wider text-neutral-500 uppercase">
            <li>
              <Link
                href="/"
                className="hover:text-neutral-900 dark:hover:text-white"
              >
                {nav("home")}
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="h-3 w-3" />
            </li>
            <li>
              <Link
                href="/shop"
                className="hover:text-neutral-900 dark:hover:text-white"
              >
                {nav("shop.label")}
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="h-3 w-3" />
            </li>
            <li
              aria-current="page"
              className="truncate text-neutral-900 dark:text-white"
            >
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 lg:sticky lg:top-24 lg:self-start dark:border-neutral-800 dark:bg-neutral-900">
            <img
              src={product.imageUrl}
              alt={product.name}
              width={600}
              height={600}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium tracking-wide text-neutral-700 dark:bg-neutral-950/90 dark:text-neutral-300">
                {badges(product.badge)}
              </span>
            )}
          </div>

          <ProductPurchaseProvider product={product}>
            <div className="flex flex-col">
              <h1 className="text-4xl leading-[1.05] font-medium tracking-[-0.02em] text-neutral-900 sm:text-5xl dark:text-white">
                {product.name}
              </h1>

              <div className="mt-6">
                <ProductPrice />
              </div>

              <p className="mt-6 max-w-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                {t("description", {
                  name: product.name,
                  sizes: sizeList(product),
                })}
              </p>

              <div className="mt-8">
                <VariantPicker />
              </div>

              <ul className="mt-8 space-y-3">
                {assurances.map(({ key, icon: Icon }) => (
                  <li
                    key={key}
                    className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-neutral-500" />
                    {t(`assurances.${key}`)}
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <ProductDetails
                  items={[
                    {
                      key: "specs",
                      title: t("details.specs.title"),
                      content: (
                        <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3">
                          <dt className="text-neutral-500">
                            {t("details.specs.form")}
                          </dt>
                          <dd className="text-neutral-900 dark:text-white">
                            {product.spec}
                          </dd>
                          <dt className="text-neutral-500">
                            {t("details.specs.sizes")}
                          </dt>
                          <dd className="text-neutral-900 dark:text-white">
                            {sizeList(product)}
                          </dd>
                          <dt className="text-neutral-500">
                            {t("details.specs.documentation")}
                          </dt>
                          <dd className="text-neutral-900 dark:text-white">
                            {t("details.specs.documentationValue")}
                          </dd>
                          <dt className="text-neutral-500">
                            {t("details.specs.use")}
                          </dt>
                          <dd className="text-neutral-900 dark:text-white">
                            {t("details.specs.useValue")}
                          </dd>
                        </dl>
                      ),
                    },
                    {
                      key: "shipping",
                      title: t("details.shipping.title"),
                      content: <p>{t("details.shipping.body")}</p>,
                    },
                    {
                      key: "payment",
                      title: t("details.payment.title"),
                      content: <p>{t("details.payment.body")}</p>,
                    },
                  ]}
                />
              </div>

              <div className="mt-8">
                <ProductPurchase />
              </div>

              <p className="mt-4 rounded-xl bg-neutral-100 p-4 text-xs leading-relaxed text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                {t("ruoNotice")}
              </p>
            </div>
          </ProductPurchaseProvider>
        </div>
      </div>
    </section>
  )
}

function RelatedProducts({
  product,
  products,
}: {
  product: Product
  products: Product[]
}) {
  const t = useTranslations("Product")

  // Products sharing an amount first, then the rest of the catalogue in its
  // usual order.
  const labels = new Set(product.variants.map((variant) => variant.label))
  const sharesSize = (other: Product) =>
    Number(other.variants.some((variant) => labels.has(variant.label)))
  const related = products
    .filter((other) => other.id !== product.id)
    .sort((a, b) => sharesSize(b) - sharesSize(a))
    .slice(0, 4)

  return (
    <section className="w-full bg-white px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[1400px] border-t border-neutral-200 pt-16 dark:border-neutral-800">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl leading-tight font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
            {t("related")}
          </h2>
          <Link
            href="/shop"
            className="shrink-0 font-mono text-xs tracking-wider text-neutral-500 uppercase hover:text-neutral-900 dark:hover:text-white"
          >
            {t("viewAll")}
          </Link>
        </div>

        {/* One row of four on desktop; below that the row scrolls sideways
            (edge to edge) instead of wrapping. */}
        <div className="-mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-3 overflow-x-auto px-4 sm:-mx-6 sm:scroll-px-6 sm:gap-4 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0 [&>*]:w-[60%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-[30%] lg:[&>*]:w-auto">
          {related.map((other) => (
            <ProductCard key={other.id} product={other} />
          ))}
        </div>
      </div>
    </section>
  )
}
