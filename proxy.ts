import createMiddleware from "next-intl/middleware"
import { NextResponse, type NextRequest } from "next/server"

import { routing } from "./i18n/routing"
import { updateSession } from "./lib/supabase/proxy"

const intl = createMiddleware(routing)

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/")

  // The storefront is localized; the admin panel is not.
  if (!isAdmin) return intl(request)

  const { response, signedIn } = await updateSession(request)
  const isLogin = pathname === "/admin/login"

  let result = response
  if (!signedIn && !isLogin) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    url.search = ""
    result = NextResponse.redirect(url)
    // Keep any cookie changes (e.g. a cleared, expired session).
    response.cookies.getAll().forEach((cookie) => result.cookies.set(cookie))
  }

  result.headers.set("X-Robots-Tag", "noindex, nofollow")
  return result
}

export const config = {
  // Skip API routes, Next internals, Vercel internals and files with an extension
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
}
