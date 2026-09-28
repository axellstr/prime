"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({
  className,
  variant = "default",
}: {
  className?: string;
  // "overlay" is for placement over dark imagery (e.g. the hero); "solid"
  // carries its own contrast over any background.
  variant?: "default" | "overlay" | "solid";
}) {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn(
        "flex items-center h-10 p-1 gap-1 rounded-md",
        variant === "overlay"
          ? "bg-white/10 ring-1 ring-inset ring-white/15 backdrop-blur-md"
          : variant === "solid"
            ? "bg-white shadow-sm ring-1 ring-inset ring-black/5"
            : "bg-neutral-200 dark:bg-neutral-900",
        className,
      )}
    >
      {routing.locales.map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          lang={l}
          title={t(l)}
          aria-current={l === locale ? "true" : undefined}
          className={cn(
            "flex items-center h-full px-2.5 rounded-sm font-mono text-xs uppercase tracking-wider transition-colors",
            variant === "overlay"
              ? l === locale
                ? "bg-white text-neutral-900"
                : "text-white/60 hover:text-white"
              : variant === "solid"
                ? l === locale
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-500 hover:text-neutral-900"
                : l === locale
                ? "bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white",
          )}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
