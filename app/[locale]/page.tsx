import { setRequestLocale } from "next-intl/server"

import { CTA13 } from "@/components/blocks/cta-13"
import { Ecommerce9 } from "@/components/blocks/ecommerce-9"
import { Footer5 } from "@/components/blocks/footer-5"
import { Hero16 } from "@/components/blocks/hero-16"
import { Showcase1 } from "@/components/blocks/showcase-1"
import { Navigation7 } from "@/components/blocks/navigation-7"

export default async function Page({
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
        <Hero16 />
        <Ecommerce9 />
        <CTA13 />
        <Showcase1 />
      </main>
      <Footer5 />
    </>
  )
}
