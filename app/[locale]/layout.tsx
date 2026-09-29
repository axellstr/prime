import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server"

import "../globals.css"
import { routing } from "@/i18n/routing"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const CLIENT_NAMESPACES = [
  "Nav",
  "Products",
  "Shop",
  "Product",
  "Cart",
  "Showcase",
  "LocaleSwitcher",
] as const

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Metadata" })

  return {
    title: { default: t("title"), template: t("titleTemplate") },
    description: t("description"),
    applicationName: "Prime",
    openGraph: {
      type: "website",
      siteName: "Prime",
      title: t("title"),
      description: t("description"),
      locale: locale === "de" ? "de_DE" : "en_GB",
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  // Only ship the namespaces client components actually use; server
  // components read the full catalog on the server.
  const messages = await getMessages()
  const clientMessages = Object.fromEntries(
    CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]])
  )

  return (
    // suppressHydrationWarning: browser extensions (password managers,
    // Bitdefender, Grammarly…) stamp attributes onto <html>/<body> before
    // React hydrates. Only silences this element's own attributes.
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={clientMessages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
