import "server-only"

import { unstable_cache } from "next/cache"

import { createPublicClient } from "@/lib/supabase/server"

/** Shown when a product has no image of its own. */
export const DEFAULT_PRODUCT_IMAGE = "/pep.webp"

export type Variant = {
  id: string
  sku: string
  /** Language-neutral amount, e.g. "5 mg". */
  label: string
  /** Price for one piece, in euro cents incl. VAT. */
  priceCents: number
  stock: number
}

export type Product = {
  id: string
  /** URL segment for the product page, e.g. /shop/peptide-a. */
  slug: string
  name: string
  /** Form and purity, e.g. "Lyophilized · ≥99%". */
  spec: string
  badge: "new" | "lowStock" | null
  imageUrl: string
  /** Cheapest variant, for "from" prices and sorting. */
  priceCents: number
  /** Active variants in display order; never empty. */
  variants: Variant[]
}

/** Invalidate with revalidateTag(PRODUCTS_TAG) when products, prices or
 *  stock change. */
export const PRODUCTS_TAG = "products"

/** Active products with their active variants, in catalogue order. Cached;
 *  stock shown from here can be up to a minute old, so anything that sells
 *  must re-check the database. */
export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const { data, error } = await createPublicClient()
      .from("products")
      .select(
        "id, slug, name, spec, badge, image_url, product_variants (id, sku, label, price_cents, stock, sort)"
      )
      .order("sort")
      .order("name")
    if (error) throw error

    return data.flatMap((row) => {
      const variants = [...row.product_variants]
        .sort((a, b) => a.sort - b.sort || a.price_cents - b.price_cents)
        .map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          label: variant.label,
          priceCents: variant.price_cents,
          stock: variant.stock,
        }))
      // A product with nothing to sell is left out of the shop.
      if (variants.length === 0) return []

      return [
        {
          id: row.id,
          slug: row.slug,
          name: row.name,
          spec: row.spec,
          badge: row.badge,
          imageUrl: row.image_url ?? DEFAULT_PRODUCT_IMAGE,
          priceCents: Math.min(...variants.map((v) => v.priceCents)),
          variants,
        },
      ]
    })
  },
  ["products"],
  { tags: [PRODUCTS_TAG], revalidate: 60 }
)

export async function getProduct(slug: string) {
  const products = await getProducts()
  return products.find((product) => product.slug === slug)
}
