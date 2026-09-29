import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { CartView } from "@/components/blocks/cart-view"
import { Footer5 } from "@/components/blocks/footer-5"
import { Navigation7 } from "@/components/blocks/navigation-7"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Cart" })

  // The cart is personal, so keep it out of search results.
  return { title: t("title"), robots: { index: false } }
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      <Navigation7 />
      <main>
        <CartView />
      </main>
      <Footer5 />
    </>
  )
}
