import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"

export function Hero12() {
  const t = useTranslations("Hero")

  return (
    <section className="relative w-full overflow-hidden bg-white px-4 py-12 sm:px-6 lg:px-8 dark:bg-black">
      <div className="relative mx-auto h-full min-h-[600px] w-full max-w-[1400px]">
        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl bg-neutral-200 dark:bg-neutral-800" />

        <div className="pointer-events-none absolute top-0 left-0 z-10 flex w-full max-w-2xl flex-col items-start">
          <div className="pointer-events-auto relative w-fit rounded-br-4xl bg-white p-4 dark:bg-black">
            <h1 className="text-3xl leading-[1.1] font-medium tracking-tight whitespace-nowrap text-neutral-900 sm:text-5xl lg:text-7xl dark:text-white">
              {t("titleLine1")}
            </h1>
            <svg
              width="40"
              height="40"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute top-0 -right-10 rotate-180 text-white dark:text-black"
            >
              <path
                d="M0 200C155.996 199.961 200.029 156.308 200 0V200H0Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="pointer-events-auto relative w-fit rounded-br-4xl bg-white p-4 dark:bg-black">
            <p className="text-3xl leading-[1.1] font-medium tracking-tight whitespace-nowrap text-neutral-500 sm:text-5xl lg:text-7xl">
              {t("titleLine2")}
            </p>

            <svg
              width="40"
              height="40"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute top-0 -right-10 rotate-180 text-white dark:text-black"
            >
              <path
                d="M0 200C155.996 199.961 200.029 156.308 200 0V200H0Z"
                fill="currentColor"
              />
            </svg>

            <svg
              width="40"
              height="40"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute -bottom-10 left-0 rotate-180 text-white dark:text-black"
            >
              <path
                d="M0 200C155.996 199.961 200.029 156.308 200 0V200H0Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="pointer-events-auto mt-8 ml-4 lg:hidden">
            <Link
              href="/shop"
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-900 shadow-lg transition-colors hover:bg-neutral-50"
            >
              {t("cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="absolute top-8 right-8 z-20 hidden lg:block">
          <Link
            href="/shop"
            className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-medium text-neutral-900 shadow-lg transition-colors hover:bg-neutral-50"
          >
            {t("cta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="absolute right-4 bottom-4 left-4 z-20 lg:right-8 lg:bottom-8 lg:left-auto lg:w-80">
          <div className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
            <div className="relative h-32 w-full overflow-hidden rounded-lg">
              <Image
                src="https://images.unsplash.com/photo-1631679706909-1844bbd07221"
                alt={t("card.imageAlt")}
                fill
                sizes="(min-width: 1024px) 320px, 100vw"
                className="object-cover"
              />
            </div>

            <div className="p-2">
              <h3 className="mb-1 text-xl font-medium text-neutral-900 dark:text-white">
                {t("card.title")}
              </h3>
              <p className="max-w-[32ch] text-sm text-neutral-600 dark:text-neutral-400">
                {t("card.body")}
              </p>
            </div>

            <Link
              href="/research-use-only"
              className="m-2 flex items-center justify-between gap-2 text-sm font-medium text-neutral-900 transition-opacity hover:opacity-70 dark:text-white"
            >
              {t("card.link")} <ArrowRight className="mr-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero12
