import "./globals.css"

// Fallback for requests that never reach app/[locale] (the proxy normally
// routes everything there). The root layout renders no <html>, so this page
// brings its own.
export default function RootNotFound() {
  return (
    <html lang="de" suppressHydrationWarning>
      <body suppressHydrationWarning className="flex min-h-svh items-center justify-center bg-white font-sans text-neutral-900 antialiased">
        <div className="px-4 text-center">
          <p className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
            404
          </p>
          <h1 className="mt-4 text-2xl font-medium tracking-tight">
            Seite nicht gefunden · Page not found
          </h1>
          <a
            href="/"
            className="mt-6 inline-block text-sm text-neutral-600 underline underline-offset-4 hover:text-neutral-900"
          >
            Prime
          </a>
        </div>
      </body>
    </html>
  )
}
