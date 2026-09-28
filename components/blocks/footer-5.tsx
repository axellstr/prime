import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

const columns = [
  {
    key: "shop",
    links: [
      { key: "all", href: "/shop" },
      { key: "new", href: "/shop/new" },
      { key: "bundle", href: "/shop/bundle" },
    ],
  },
  {
    key: "service",
    links: [
      { key: "shipping", href: "/shipping" },
      { key: "payment", href: "/payment" },
      { key: "faq", href: "/faq" },
      { key: "contact", href: "/contact" },
    ],
  },
  {
    key: "legal",
    links: [
      { key: "imprint", href: "/impressum" },
      { key: "privacy", href: "/datenschutz" },
      { key: "terms", href: "/agb" },
      { key: "withdrawal", href: "/widerruf" },
    ],
  },
] as const;

export function Footer5() {
  const t = useTranslations("Footer");
  const brand = useTranslations("Brand");

  return (
    <footer className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col items-center">
        <div className="relative w-full rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
            <div className="flex flex-col space-y-6 sm:space-y-8">
              <div className="flex items-center gap-2">
                <img
                  src="/Prime-logo-light.svg"
                  alt={brand("name")}
                  width={243}
                  height={40}
                  className="h-10 w-auto"
                />
              </div>

              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm font-medium">
                {t("description")}
              </p>

              <p className="text-xs text-neutral-500 leading-relaxed max-w-sm border-l border-neutral-800 pl-4">
                {t("ruoNotice")}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
              {columns.map((column) => (
                <div key={column.key} className="flex flex-col space-y-4">
                  <h3 className="text-lg font-medium tracking-tight text-neutral-900 dark:text-white">
                    {t(`${column.key}.title`)}
                  </h3>
                  <ul className="space-y-3">
                    {column.links.map((link) => (
                      <li key={link.key}>
                        <Link
                          href={link.href}
                          className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                        >
                          {t(`${column.key}.${link.key}`)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 flex flex-col items-center gap-2 text-center text-sm text-neutral-500 font-medium">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p className="text-xs">{t("vatNotice")}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer5;
