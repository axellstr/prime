import { useEffect, useState, useSyncExternalStore } from "react"

import { getVariantsByIds, type CartVariant } from "@/lib/cart-actions"
import { MAX_QUANTITY } from "@/lib/cart-limits"
import { vatIncluded } from "@/lib/money"
import { shippingCents } from "@/lib/shipping"

/** What is persisted: variant ids and quantities only. Prices are always
 *  fetched fresh from the database, so a stale cart can never carry an old
 *  price. */
export type CartItem = { variantId: string; quantity: number }

export type CartLine = CartItem & { variant: CartVariant; totalCents: number }

export { MAX_QUANTITY }

// v2: items keyed by variant. The v1 cart (keyed by product) is discarded.
const STORAGE_KEY = "prime-cart-v2"
const LEGACY_STORAGE_KEY = "prime-cart"
const EMPTY: CartItem[] = []

// Read lazily on first use in the browser; null until then.
let items: CartItem[] | null = null
const listeners = new Set<() => void>()

function read(): CartItem[] {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    const parsed: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]"
    )
    if (!Array.isArray(parsed)) return EMPTY
    // Drop malformed entries and duplicates. Whether a variant still exists
    // is checked against the database by useCartVariants.
    const seen = new Set<string>()
    return parsed.flatMap((entry) => {
      const { variantId, quantity } = (entry ?? {}) as Partial<CartItem>
      if (typeof variantId !== "string" || seen.has(variantId)) return []
      if (!Number.isInteger(quantity) || quantity! < 1) return []
      seen.add(variantId)
      return [{ variantId, quantity: Math.min(quantity!, MAX_QUANTITY) }]
    })
  } catch {
    return EMPTY
  }
}

function emit() {
  listeners.forEach((listener) => listener())
}

function write(next: CartItem[]) {
  items = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage full or blocked: the cart still works for this page view.
  }
  emit()
}

// Keeps carts in other tabs in step.
function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return
  items = read()
  emit()
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener("storage", onStorage)
  }
}

function getSnapshot() {
  items ??= read()
  return items
}

const getServerSnapshot = () => EMPTY

function current() {
  return getSnapshot()
}

export function addToCart(variantId: string, quantity = 1) {
  const existing = current().find((item) => item.variantId === variantId)
  if (existing) {
    setQuantity(variantId, existing.quantity + quantity)
  } else {
    write([
      ...current(),
      { variantId, quantity: Math.min(quantity, MAX_QUANTITY) },
    ])
  }
}

export function setQuantity(variantId: string, quantity: number) {
  if (quantity < 1) return removeFromCart(variantId)
  write(
    current().map((item) =>
      item.variantId === variantId
        ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }
        : item
    )
  )
}

export function removeFromCart(variantId: string) {
  write(current().filter((item) => item.variantId !== variantId))
}

export function clearCart() {
  write([])
}

export function useCartItems() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

const noop = () => () => {}

/** False during SSR and hydration, so the cart can show a placeholder
 *  instead of flashing "empty" before the saved cart is read. */
export function useCartReady() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
}

export function cartCount(cartItems: CartItem[]) {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0)
}

type VariantsState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; variants: Map<string, CartVariant> }

/** Fetches current prices and stock for the cart's variants and drops items
 *  whose variant is no longer sold. Refetches when the set of variants or
 *  `refreshKey` (compared by identity) changes, not on quantity changes. */
export function useCartVariants(
  cartItems: CartItem[],
  refreshKey: unknown = null
): VariantsState {
  const ids = cartItems.map((item) => item.variantId).sort()
  const key = ids.join(",")
  const [fetched, setFetched] = useState<{
    key: string
    variants: Map<string, CartVariant> | null
  } | null>(null)

  useEffect(() => {
    if (!key) return
    let cancelled = false
    const requested = key.split(",")

    getVariantsByIds(requested).then(
      (list) => {
        if (cancelled) return
        const variants = new Map(list.map((variant) => [variant.id, variant]))
        setFetched({ key, variants })
        const gone = requested.filter((id) => !variants.has(id))
        if (gone.length > 0) {
          write(current().filter((item) => !gone.includes(item.variantId)))
        }
      },
      () => {
        if (!cancelled) setFetched({ key, variants: null })
      }
    )

    return () => {
      cancelled = true
    }
  }, [key, refreshKey])

  if (!key) return { status: "ready", variants: new Map() }
  if (fetched?.key === key && fetched.variants === null) {
    return { status: "error" }
  }
  // After a removal the last result still covers every id, so keep showing
  // it while the refetch runs instead of flashing a placeholder.
  const variants = fetched?.variants
  if (variants && ids.every((id) => variants.has(id))) {
    return { status: "ready", variants }
  }
  return { status: "loading" }
}

/** All amounts in cents. */
export function summarizeCart(
  cartItems: CartItem[],
  variants: Map<string, CartVariant>
) {
  const lines: CartLine[] = cartItems.flatMap((item) => {
    const variant = variants.get(item.variantId)
    return variant
      ? [{ ...item, variant, totalCents: variant.priceCents * item.quantity }]
      : []
  })

  const count = cartCount(lines)
  const subtotalCents = lines.reduce((sum, line) => sum + line.totalCents, 0)
  const shipping = lines.length > 0 ? shippingCents(subtotalCents) : 0
  const totalCents = subtotalCents + shipping

  return {
    lines,
    count,
    subtotalCents,
    shippingCents: shipping,
    totalCents,
    vatCents: vatIncluded(totalCents),
    /** Some line asks for more than is in stock; checkout would fail. */
    hasStockIssue: lines.some((line) => line.quantity > line.variant.stock),
  }
}
