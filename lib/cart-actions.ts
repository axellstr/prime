"use server"

import * as z from "zod"

import { DEFAULT_PRODUCT_IMAGE, type Variant } from "@/lib/products"
import { createPublicClient } from "@/lib/supabase/server"

export type CartVariant = Variant & {
  product: { id: string; slug: string; name: string; imageUrl: string }
}

const idsSchema = z.array(z.uuid()).max(50)

/** Current prices and stock for the variants in a cart, read fresh from the
 *  database. Unknown, inactive or malformed ids are simply left out. */
export async function getVariantsByIds(ids: string[]): Promise<CartVariant[]> {
  const parsed = idsSchema.safeParse(ids)
  if (!parsed.success || parsed.data.length === 0) return []

  const { data, error } = await createPublicClient()
    .from("product_variants")
    .select(
      "id, sku, label, price_cents, stock, products!inner (id, slug, name, image_url)"
    )
    .in("id", parsed.data)
  if (error) throw error

  return data.map((row) => ({
    id: row.id,
    sku: row.sku,
    label: row.label,
    priceCents: row.price_cents,
    stock: row.stock,
    product: {
      id: row.products.id,
      slug: row.products.slug,
      name: row.products.name,
      imageUrl: row.products.image_url ?? DEFAULT_PRODUCT_IMAGE,
    },
  }))
}
