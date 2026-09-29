export type Product = {
  id: string
  /** URL segment for the product page, e.g. /shop/peptide-a. */
  slug: string
  name: string
  spec: string
  /** Price for one piece, in EUR incl. VAT. */
  price: number
  badge?: "new" | "lowStock"
}

// TODO: placeholder catalogue — replace with real products and prices.
export const products: Product[] = [
  {
    id: "a",
    slug: "peptide-a",
    name: "Peptide A",
    spec: "5 mg",
    price: 29.9,
    badge: "new",
  },
  { id: "b", slug: "peptide-b", name: "Peptide B", spec: "5 mg", price: 34.9 },
  { id: "c", slug: "peptide-c", name: "Peptide C", spec: "10 mg", price: 44.9 },
  {
    id: "d",
    slug: "peptide-d",
    name: "Peptide D",
    spec: "2 mg",
    price: 24.9,
    badge: "lowStock",
  },
  { id: "e", slug: "peptide-e", name: "Peptide E", spec: "5 mg", price: 39.9 },
  { id: "f", slug: "peptide-f", name: "Peptide F", spec: "10 mg", price: 49.9 },
  { id: "g", slug: "peptide-g", name: "Peptide G", spec: "5 mg", price: 32.9 },
  {
    id: "h",
    slug: "peptide-h",
    name: "Peptide H",
    spec: "10 mg",
    price: 54.9,
    badge: "new",
  },
  { id: "i", slug: "peptide-i", name: "Peptide I", spec: "2 mg", price: 27.9 },
]

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug)
}
