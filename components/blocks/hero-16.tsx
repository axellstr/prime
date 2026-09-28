import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import heroImage from "@/public/hero.webp"

export function Hero16() {
  const t = useTranslations("Hero")

  return (
    // Fills the viewport; the 88px navigation bar overlays the top, so the
    // content is pushed down by that height plus the regular padding.
    <section className="relative flex min-h-svh w-full flex-col overflow-hidden bg-neutral-950 px-4 pt-[136px] pb-12 sm:px-6 lg:px-8">
      <Image
        src={heroImage}
        alt={t("imageAlt")}
        fill
        sizes="100vw"
        preload
        className="object-cover object-[72%_center]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-r from-neutral-950/70 via-neutral-950/20 to-transparent"
      />
      {/* Keeps the transparent navigation legible over bright image areas. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-neutral-950/60 to-transparent"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col">
        <div className="flex flex-1 items-start pt-12 sm:pt-16 md:pt-20">
          <h1 className="max-w-4xl text-4xl leading-[1.05] font-medium tracking-[-0.02em] text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
            {t("titleLine1")}
            <br />
            <span className="text-neutral-400">{t("titleLine2")}</span>
          </h1>
        </div>

        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end sm:gap-8">
          <p className="max-w-md min-w-0 flex-1 text-sm leading-relaxed font-normal text-neutral-300 sm:text-base md:text-lg">
            {t("meta")}
          </p>

          <div className="flex w-full shrink-0 items-center gap-2.5 sm:w-auto">
            <Link
              href="/shop"
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-white px-7 py-3.5 font-mono text-[11px] font-medium tracking-[0.12em] text-neutral-900 uppercase hover:bg-neutral-100 sm:flex-none sm:px-8 sm:py-4 sm:text-xs"
            >
              {t("cta")}
            </Link>
            <Link
              href="/shop"
              aria-label={t("cta")}
              tabIndex={-1}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-neutral-900 hover:bg-neutral-100 sm:h-12 sm:w-12"
            >
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero16
