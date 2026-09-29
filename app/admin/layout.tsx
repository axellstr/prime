import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "../globals.css"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Prime Admin" },
  robots: { index: false, follow: false },
}

// Outside app/[locale]: English only, not translated, not in any sitemap.
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: see app/[locale]/layout.tsx.
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body suppressHydrationWarning className="min-h-svh bg-muted/40">
        {children}
      </body>
    </html>
  )
}
