import { setRequestLocale } from "next-intl/server"

import { Footer5 } from "@/components/blocks/footer-5"
import { Hero12 } from "@/components/blocks/hero-12"
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
        <Hero12 />
      </main>
      <Footer5 />
    </>
  )
}
