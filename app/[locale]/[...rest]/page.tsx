import { notFound } from "next/navigation"

// Sends unknown paths to app/[locale]/not-found.tsx, which renders inside the
// locale layout (the root layout has no <html> shell of its own).
export default function CatchAllPage() {
  notFound()
}
