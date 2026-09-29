function required(name: string, value: string | undefined) {
  if (!value) throw new Error(`Missing environment variable ${name}`)
  return value
}

// NEXT_PUBLIC_* must be read with literal property access so Next.js can
// inline them into the browser bundle.
export const supabaseUrl = () =>
  required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL)

export const supabaseAnonKey = () =>
  required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
