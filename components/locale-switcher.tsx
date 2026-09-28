"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn(
        "flex items-center h-10 p-1 gap-1 bg-neutral-900 rounded-md",
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
            l === locale
              ? "bg-neutral-800 text-white"
              : "text-neutral-500 hover:text-white",
          )}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
