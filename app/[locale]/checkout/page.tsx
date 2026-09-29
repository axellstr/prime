import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { CheckoutView } from "@/components/blocks/checkout-view"
import { Footer5 } from "@/components/blocks/footer-5"
import { Navigation7 } from "@/components/blocks/navigation-7"
import { ENABLED_PAYMENT_METHODS } from "@/lib/payments"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Checkout" })

  return { title: t("metaTitle"), robots: { index: false } }
}

export default async function CheckoutPage({
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
        <CheckoutView paymentMethods={ENABLED_PAYMENT_METHODS} />
      </main>
      <Footer5 />
    </>
  )
}
