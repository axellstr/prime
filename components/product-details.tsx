"use client"

import { useId, useState } from "react"
import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"

type DetailsItem = { key: string; title: string; content: React.ReactNode }

/**
 * Accordion that never changes the page height, so the controls below it stay
 * put: exactly one section is always open, and every panel is sized to the
 * tallest content by stacking all contents in one grid cell and hiding the
 * inactive ones. Opening and closing panels animate in step, so the total
 * height stays constant during the transition as well.
 */
export function ProductDetails({ items }: { items: DetailsItem[] }) {
  const id = useId()
  const [openKey, setOpenKey] = useState(items[0]?.key)

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800">
      {items.map((item) => {
        const isOpen = item.key === openKey
        const panelId = `${id}-${item.key}`

        return (
          <div
            key={item.key}
            className="border-b border-neutral-200 dark:border-neutral-800"
          >
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenKey(item.key)}
                className={cn(
                  "flex w-full items-center justify-between py-4 text-left text-sm font-medium text-neutral-900 focus:outline-none focus-visible:underline focus-visible:underline-offset-4 dark:text-white",
                  isOpen ? "cursor-default" : "cursor-pointer"
                )}
              >
                {item.title}
                <Plus
                  aria-hidden
                  className={cn(
                    "h-4 w-4 text-neutral-500 transition-transform duration-300",
                    isOpen && "rotate-45"
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-label={item.title}
              inert={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="grid pb-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {items.map((sizer) => (
                    <div
                      key={sizer.key}
                      aria-hidden={sizer.key !== item.key || undefined}
                      className={cn(
                        "[grid-area:1/1]",
                        sizer.key !== item.key && "invisible"
                      )}
                    >
                      {sizer.content}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
