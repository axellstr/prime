import { useTranslations } from "next-intl"

import { Footer5 } from "@/components/blocks/footer-5"
import { Navigation7 } from "@/components/blocks/navigation-7"
import { Link } from "@/i18n/navigation"

export default function NotFound() {
  const t = useTranslations("NotFound")

  return (
    <>
      <Navigation7 />
      <main>
        {/* The 88px navigation bar overlays the top, so the content is pushed
            down by that height plus the regular padding. */}
        <section className="w-full bg-white px-4 pt-[136px] pb-16 sm:px-6 sm:pb-24 lg:px-8 dark:bg-neutral-950">
          <div className="mx-auto w-full max-w-[1400px]">
            <p className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
              {t("eyebrow")}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl leading-[1.05] font-medium tracking-[-0.02em] text-neutral-900 sm:text-5xl md:text-6xl dark:text-white">
              {t("heading")}
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
              {t("body")}
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-7 py-3.5 font-mono text-[11px] font-medium tracking-[0.12em] text-white uppercase hover:bg-neutral-800 sm:text-xs dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                {t("shop")}
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-7 py-3.5 font-mono text-[11px] font-medium tracking-[0.12em] text-neutral-900 uppercase hover:bg-neutral-200 sm:text-xs dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
              >
                {t("home")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer5 />
    </>
  )
}
