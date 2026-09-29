import { useSyncExternalStore } from "react"

import { products, type Product } from "@/lib/products"

/** What is persisted: product ids and quantities only. Prices always come
 *  from the catalogue, so a stale cart can never carry an old price. */
export type CartItem = { id: string; quantity: number }

export type CartLine = CartItem & { product: Product; total: number }

export const MAX_QUANTITY = 10
/** Catalogue prices include German VAT. */
const VAT_RATE = 0.19

const STORAGE_KEY = "prime-cart"
const EMPTY: CartItem[] = []

// Read lazily on first use in the browser; null until then.
let items: CartItem[] | null = null
const listeners = new Set<() => void>()

function read(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]"
    )
    if (!Array.isArray(parsed)) return EMPTY
    // Drop anything that is no longer in the catalogue or malformed.
    return parsed.flatMap((entry) => {
      const { id, quantity } = (entry ?? {}) as Partial<CartItem>
      if (!products.some((product) => product.id === id)) return []
      if (!Number.isInteger(quantity) || quantity! < 1) return []
      return [{ id: id!, quantity: Math.min(quantity!, MAX_QUANTITY) }]
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

export function addToCart(id: string, quantity = 1) {
  const existing = current().find((item) => item.id === id)
  if (existing) {
    setQuantity(id, existing.quantity + quantity)
  } else {
    write([...current(), { id, quantity: Math.min(quantity, MAX_QUANTITY) }])
  }
}

export function setQuantity(id: string, quantity: number) {
  if (quantity < 1) return removeFromCart(id)
  write(
    current().map((item) =>
      item.id === id
        ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }
        : item
    )
  )
}

export function removeFromCart(id: string) {
  write(current().filter((item) => item.id !== id))
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

export function summarizeCart(cartItems: CartItem[]) {
  const lines: CartLine[] = cartItems.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.id)
    return product
      ? [{ ...item, product, total: product.price * item.quantity }]
      : []
  })

  const count = lines.reduce((sum, line) => sum + line.quantity, 0)
  const subtotal = lines.reduce((sum, line) => sum + line.total, 0)

  const total = subtotal
  const vat = total - total / (1 + VAT_RATE)

  return { lines, count, subtotal, total, vat }
}
