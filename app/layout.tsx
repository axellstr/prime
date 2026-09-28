// The <html> shell lives in app/[locale]/layout.tsx so `lang` follows the locale.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
