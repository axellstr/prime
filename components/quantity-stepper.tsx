"use client"

import { Minus, Plus } from "lucide-react"
import { useTranslations } from "next-intl"

import { MAX_QUANTITY } from "@/lib/cart"
import { cn } from "@/lib/utils"

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = MAX_QUANTITY,
  size = "default",
  className,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: "default" | "sm"
  className?: string
}) {
  const t = useTranslations("Product")

  const stepClass = cn(
    "flex h-full cursor-pointer items-center justify-center text-neutral-600 transition-colors hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30 dark:text-neutral-400 dark:hover:text-white",
    size === "sm" ? "w-9" : "w-11"
  )

  return (
    <div
      role="group"
      aria-label={t("quantity")}
      className={cn(
        "flex shrink-0 items-center justify-between rounded-xl bg-neutral-100 dark:bg-neutral-900",
        size === "sm" ? "h-10 w-28" : "h-12",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={t("decrease")}
        className={stepClass}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        aria-live="polite"
        className="text-sm font-medium text-neutral-900 tabular-nums dark:text-white"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={t("increase")}
        className={stepClass}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
