"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

type ShowcaseKey = "testing" | "documentation" | "dispatch" | "delivery"

interface ShowcaseItem {
  key: ShowcaseKey
  /** Optional photo; a neutral placeholder is shown until one is set. */
  image?: string
}

// TODO: add photos for remaining steps.
const items: ShowcaseItem[] = [
  { key: "testing", image: "/purity.webp" },
  { key: "documentation" },
  { key: "dispatch" },
  { key: "delivery" },
]

export function Showcase1() {
  const t = useTranslations("Showcase")
  const [activeKey, setActiveKey] = useState<ShowcaseKey>(items[0].key)

  const activeIndex = items.findIndex((item) => item.key === activeKey)
  const activeItem = items[activeIndex]

  return (
    <section className="w-full bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-24 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[1400px]">
        <h2 className="mb-8 px-4 font-mono text-xs tracking-widest text-neutral-500 uppercase sm:px-6 lg:mb-10">
          {t("eyebrow")}
        </h2>

        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_600px] lg:gap-16 xl:gap-20">
          <div className="relative flex flex-col">
            {items.map((item) => {
              const isActive = item.key === activeKey

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveKey(item.key)}
                  aria-pressed={isActive}
                  className={cn(
                    "relative w-full rounded-lg py-6 text-left sm:py-8",
                    isActive && "bg-neutral-900 dark:bg-white"
                  )}
                >
                  <div
                    className={cn(
                      "relative flex items-center justify-between gap-4 px-4 sm:px-6",
                      !isActive && "hover:opacity-60"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <h3
                        className={cn(
                          "mb-2 truncate text-xl font-medium tracking-tight sm:text-2xl md:text-3xl lg:text-4xl",
                          isActive
                            ? "text-white dark:text-neutral-900"
                            : "text-neutral-900 dark:text-white"
                        )}
                      >
                        {t(`items.${item.key}.title`)}
                      </h3>
                      <p
                        className={cn(
                          "text-sm",
                          isActive
                            ? "text-neutral-300 dark:text-neutral-600"
                            : "text-neutral-600 dark:text-neutral-400"
                        )}
                      >
                        {t(`items.${item.key}.subtitle`)}
                      </p>
                    </div>
                    {isActive && (
                      <span className="h-4 w-4 shrink-0 rounded-full bg-white dark:bg-neutral-900" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="relative order-first h-[300px] w-full overflow-hidden rounded-2xl bg-neutral-100 sm:h-[400px] lg:order-none lg:h-full dark:bg-neutral-900">
            {activeItem.image ? (
              <img
                src={activeItem.image}
                alt={t(`items.${activeItem.key}.title`)}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
                <img
                  src="/prime-fav.svg"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 opacity-20 dark:invert"
                />
                <p className="text-7xl font-medium tracking-tight text-neutral-300 tabular-nums sm:text-8xl dark:text-neutral-700">
                  {String(activeIndex + 1).padStart(2, "0")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Showcase1
