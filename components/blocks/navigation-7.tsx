"use client"

import { useEffect, useState } from "react"
import { ChevronDown, Menu, ShoppingBag, X } from "lucide-react"
import { useTranslations } from "next-intl"

import { LocaleSwitcher } from "@/components/locale-switcher"
import { Link } from "@/i18n/navigation"
import { cartCount as countItems, useCartItems } from "@/lib/cart"
import { cn } from "@/lib/utils"

interface DropdownItem {
  key: string
  href: string
  hasBadge?: boolean
}

interface NavItem {
  key: "shop" | "quality" | "service"
  items: DropdownItem[]
}

const navItems: NavItem[] = [
  {
    key: "shop",
    items: [
      { key: "all", href: "/shop" },
      { key: "new", href: "/shop/new" },
    ],
  },
  {
    key: "quality",
    items: [
      { key: "coa", href: "/quality" },
      { key: "ruo", href: "/research-use-only" },
    ],
  },
  {
    key: "service",
    items: [
      { key: "shipping", href: "/shipping" },
      { key: "payment", href: "/payment" },
      { key: "faq", href: "/faq" },
      { key: "contact", href: "/contact" },
    ],
  },
]

export function Navigation7() {
  const t = useTranslations("Nav")
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mobileExpandedItem, setMobileExpandedItem] = useState<string | null>(
    null
  )
  const [isAtTop, setIsAtTop] = useState(true)
  const [isHidden, setIsHidden] = useState(false)
  const cartCount = countItems(useCartItems())

  // Slides away while scrolling down and returns on the slightest scroll up,
  // so it stays out of the way without having to go back to the top.
  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY
      setIsAtTop(y < 8)
      if (y < 88) setIsHidden(false)
      else if (delta > 4) setIsHidden(true)
      else if (delta < -4) setIsHidden(false)
      lastY = y
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Solid pills carry their own contrast, so the bar needs no background
  // over either the dark hero or the light and dark sections below it.
  const controlClass =
    "bg-white text-neutral-900 shadow-sm ring-1 ring-black/5 ring-inset transition-colors hover:bg-neutral-100"

  return (
    <>
      <nav
        className={cn(
          "fixed inset-x-0 top-0 z-40 w-full px-4 transition-[translate,padding] duration-300 ease-out sm:px-6 lg:px-8",
          isAtTop ? "py-6" : "py-4",
          // Keep it in place while a dropdown is open.
          isHidden && !activeDropdown && "-translate-y-full"
        )}
      >
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className={cn(
                "flex aspect-square h-10 items-center justify-center rounded-md",
                controlClass
              )}
              aria-label={t("home")}
            >
              <img
                src="/prime-fav.svg"
                alt=""
                width={20}
                height={20}
                className="h-5 w-5"
              />
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.key)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className={cn(
                      "flex h-10 items-center gap-1.5 rounded-md px-4 text-sm font-medium tracking-tight",
                      controlClass
                    )}
                    aria-expanded={activeDropdown === item.key}
                    aria-haspopup="true"
                  >
                    {t(`${item.key}.label`)}
                  </button>

                  {activeDropdown === item.key && (
                    <div className="absolute top-full left-0 z-50 pt-2">
                      <div className="min-w-[500px] rounded-2xl border border-neutral-200 bg-white py-2 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="my-4 px-4 text-xs font-medium tracking-wider text-neutral-400 dark:text-neutral-500">
                          {t(`${item.key}.title`)}
                        </div>
                        <div className="grid grid-cols-2 gap-3 px-2">
                          {item.items.map((dropdownItem) => (
                            <div key={dropdownItem.key}>
                              <Link
                                href={dropdownItem.href}
                                className="group block rounded-sm p-3 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              >
                                <div className="mb-1 flex items-center gap-2">
                                  <h3 className="text-sm font-medium tracking-tight text-neutral-900 transition-colors group-hover:text-neutral-950 dark:text-neutral-100 dark:group-hover:text-white">
                                    {t(
                                      `${item.key}.items.${dropdownItem.key}.title`
                                    )}
                                  </h3>
                                  {dropdownItem.hasBadge && (
                                    <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                      {t(
                                        `${item.key}.items.${dropdownItem.key}.badge`
                                      )}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                                  {t(
                                    `${item.key}.items.${dropdownItem.key}.description`
                                  )}
                                </p>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LocaleSwitcher variant="solid" className="hidden md:flex" />
            <Link
              href="/cart"
              aria-label={t("cartCount", { count: cartCount })}
              className={cn(
                "flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium tracking-tight",
                controlClass
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">{t("cart")}</span>
              {cartCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1.5 text-[11px] font-semibold text-white tabular-nums">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={cn(
                "flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium tracking-tight md:hidden",
                controlClass
              )}
              aria-label={t("openMenu")}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden dark:bg-black">
          <div className="flex items-center justify-between px-4 py-6">
            <div className="flex aspect-square h-10 items-center justify-center rounded-md bg-neutral-200 dark:bg-neutral-900">
              <img
                src="/prime-fav.svg"
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 dark:invert"
              />
            </div>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                setMobileExpandedItem(null)
              }}
              className="flex h-10 items-center gap-2 rounded-md bg-neutral-200 px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-300 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
              aria-label={t("closeMenu")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="h-[calc(100vh-240px)] overflow-y-auto p-4 sm:p-6">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <div key={item.key}>
                  <button
                    onClick={() =>
                      setMobileExpandedItem(
                        mobileExpandedItem === item.key ? null : item.key
                      )
                    }
                    className="flex w-full items-center justify-between rounded-md bg-neutral-100 px-4 py-3 text-left transition-colors hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                  >
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {t(`${item.key}.label`)}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-neutral-500 dark:text-neutral-400 ${
                        mobileExpandedItem === item.key ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {mobileExpandedItem === item.key && (
                    <div className="overflow-hidden">
                      <div className="space-y-1 pt-2 pb-1">
                        {item.items.map((dropdownItem) => (
                          <div key={dropdownItem.key}>
                            <Link
                              href={dropdownItem.href}
                              onClick={() => {
                                setIsMobileMenuOpen(false)
                                setMobileExpandedItem(null)
                              }}
                              className="block rounded-md p-3 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                              <div className="mb-1 flex items-center gap-2">
                                <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                  {t(
                                    `${item.key}.items.${dropdownItem.key}.title`
                                  )}
                                </h3>
                                {dropdownItem.hasBadge && (
                                  <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                    {t(
                                      `${item.key}.items.${dropdownItem.key}.badge`
                                    )}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                                {t(
                                  `${item.key}.items.${dropdownItem.key}.description`
                                )}
                              </p>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="fixed right-0 bottom-0 left-0 space-y-3 border-t border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-black">
            <LocaleSwitcher className="w-full justify-center" />
            <Link
              href="/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              <ShoppingBag className="h-4 w-4" />
              {t("cart")}
              {cartCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-semibold text-neutral-900 tabular-nums dark:bg-neutral-900 dark:text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}
    </>
  )
}

export default Navigation7
