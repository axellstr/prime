"use client"

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useLocale, useTranslations } from "next-intl"

import { OrderTotals } from "@/components/order-totals"
import { Link, useRouter } from "@/i18n/navigation"
import {
  clearCart,
  summarizeCart,
  useCartItems,
  useCartReady,
  useCartVariants,
} from "@/lib/cart"
import { createOrder, type CheckoutState } from "@/lib/checkout-actions"
import { checkoutSchema, type CheckoutField } from "@/lib/checkout-schema"
import { useFormatCents } from "@/lib/money"
import type { PaymentMethod } from "@/lib/payments/types"
import { SHIPPING_COUNTRIES } from "@/lib/shipping"
import { cn } from "@/lib/utils"

type Summary = ReturnType<typeof summarizeCart>

const initialState: CheckoutState = { status: "idle" }

export function CheckoutView({
  paymentMethods,
}: {
  paymentMethods: PaymentMethod[]
}) {
  const t = useTranslations("Checkout")
  const locale = useLocale()
  const router = useRouter()
  const ready = useCartReady()
  const items = useCartItems()
  const [state, formAction, pending] = useActionState(createOrder, initialState)
  // Each rejection is a new state object, which refetches prices and stock
  // so the customer sees the current ones before retrying.
  const variants = useCartVariants(
    items,
    state.status === "rejected" ? state : null
  )
  const cart =
    variants.status === "ready" ? summarizeCart(items, variants.variants) : null

  // Set by the client-side check; the server result takes over once the
  // form has been sent.
  const [clientInvalid, setClientInvalid] = useState<CheckoutField[] | null>(
    null
  )
  const invalid = new Set(
    clientInvalid ?? (state.status === "invalid" ? state.fields : [])
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.status === "success") {
      router.replace(`/checkout/confirmation/${state.orderId}`)
      clearCart()
    } else if (state.status === "invalid") {
      focusFirstInvalid(formRef.current)
    }
  }, [state, router])

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Sent manually so React does not reset the form after the action.
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    const result = checkoutSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) {
      setClientInvalid([
        ...new Set(
          result.error.issues.map((issue) => issue.path[0] as CheckoutField)
        ),
      ])
      // After React has marked the fields invalid.
      requestAnimationFrame(() => focusFirstInvalid(form))
      return
    }
    setClientInvalid(null)
    startTransition(() => formAction(formData))
  }

  return (
    // The 88px navigation bar overlays the top, so the content is pushed
    // down by that height plus the regular padding.
    <section className="w-full bg-white px-4 pt-[136px] pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[1400px]">
        <p className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 text-4xl leading-[1.05] font-medium tracking-[-0.02em] text-neutral-900 sm:text-5xl md:text-6xl dark:text-white">
          {t("title")}
        </h1>

        {state.status === "success" ? (
          <p
            role="status"
            className="mt-10 rounded-2xl bg-neutral-100 px-6 py-10 text-center text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
          >
            {t("redirecting")}
          </p>
        ) : variants.status === "error" ? (
          <p
            role="alert"
            className="mt-10 rounded-2xl bg-neutral-100 px-6 py-10 text-center text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
          >
            {t("loadError")}
          </p>
        ) : !ready || !cart ? (
          <div
            aria-hidden
            className="mt-10 h-96 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-900"
          />
        ) : cart.lines.length === 0 ? (
          <EmptyCheckout />
        ) : (
          <form
            ref={formRef}
            noValidate
            onSubmit={onSubmit}
            className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_440px] lg:gap-16"
          >
            <input type="hidden" name="locale" value={locale} />
            <input
              type="hidden"
              name="items"
              value={JSON.stringify(
                cart.lines.map(({ variantId, quantity }) => ({
                  variantId,
                  quantity,
                }))
              )}
            />
            <input
              type="hidden"
              name="expectedTotalCents"
              value={cart.totalCents}
            />

            <div className="space-y-10">
              <StatusBanner state={state} hasInvalid={invalid.size > 0} />

              <Fieldset legend={t("contact.title")}>
                <Field
                  name="email"
                  type="email"
                  autoComplete="email"
                  invalid={invalid}
                  className="sm:col-span-2"
                />
                <Field
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  invalid={invalid}
                  optional
                  className="sm:col-span-2"
                />
              </Fieldset>

              <Fieldset legend={t("address.title")}>
                <Field
                  name="name"
                  autoComplete="name"
                  invalid={invalid}
                  className="sm:col-span-2"
                />
                <Field
                  name="street"
                  autoComplete="street-address"
                  invalid={invalid}
                  className="sm:col-span-2"
                />
                <Field
                  name="zip"
                  autoComplete="postal-code"
                  invalid={invalid}
                />
                <Field
                  name="city"
                  autoComplete="address-level2"
                  invalid={invalid}
                />
                <CountrySelect invalid={invalid} />
              </Fieldset>

              <PaymentMethods methods={paymentMethods} />
            </div>

            <OrderReview cart={cart} invalid={invalid} pending={pending} />
          </form>
        )}
      </div>
    </section>
  )
}

function focusFirstInvalid(form: HTMLFormElement | null) {
  form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
}

function StatusBanner({
  state,
  hasInvalid,
}: {
  state: CheckoutState
  hasInvalid: boolean
}) {
  const t = useTranslations("Checkout")

  const message =
    state.status === "rejected"
      ? t(`rejected.${state.reason}`)
      : state.status === "failed"
        ? t("failed")
        : hasInvalid
          ? t("errors.summary")
          : null
  if (!message) return null

  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
    >
      {message}
      {state.status === "rejected" && (
        <>
          {" "}
          <Link href="/cart" className="font-medium underline">
            {t("backToCart")}
          </Link>
        </>
      )}
    </div>
  )
}

function Fieldset({
  legend,
  children,
}: {
  legend: string
  children: React.ReactNode
}) {
  return (
    <fieldset>
      <legend className="text-lg font-medium tracking-tight text-neutral-900 dark:text-white">
        {legend}
      </legend>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {children}
      </div>
    </fieldset>
  )
}

const inputClass =
  "h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 aria-invalid:border-red-500 aria-invalid:ring-red-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-white dark:focus:ring-white"

type TextField = Exclude<CheckoutField, "country" | "terms">

function Field({
  name,
  type = "text",
  autoComplete,
  invalid,
  optional = false,
  className,
}: {
  name: TextField
  type?: string
  autoComplete: string
  invalid: Set<CheckoutField>
  optional?: boolean
  className?: string
}) {
  const t = useTranslations("Checkout")
  const id = `checkout-${name}`
  const isInvalid = invalid.has(name)

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="text-sm font-medium text-neutral-900 dark:text-white"
      >
        {t(`fields.${name}`)}
        {optional && (
          <span className="font-normal text-neutral-500"> {t("optional")}</span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={!optional}
        aria-invalid={isInvalid || undefined}
        aria-describedby={isInvalid ? `${id}-error` : undefined}
        className={cn(inputClass, "mt-2")}
      />
      {isInvalid && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-sm text-red-600 dark:text-red-400"
        >
          {t(`errors.${name}`)}
        </p>
      )}
    </div>
  )
}

function CountrySelect({ invalid }: { invalid: Set<CheckoutField> }) {
  const t = useTranslations("Checkout")
  const locale = useLocale()
  const isInvalid = invalid.has("country")

  // Germany first, the rest alphabetically in the page's language.
  const countries = useMemo(() => {
    const names = new Intl.DisplayNames([locale], { type: "region" })
    const [home, ...rest] = SHIPPING_COUNTRIES.map((code) => ({
      code,
      name: names.of(code) ?? code,
    }))
    return [home, ...rest.sort((a, b) => a.name.localeCompare(b.name, locale))]
  }, [locale])

  return (
    <div className="sm:col-span-2">
      <label
        htmlFor="checkout-country"
        className="text-sm font-medium text-neutral-900 dark:text-white"
      >
        {t("fields.country")}
      </label>
      <select
        id="checkout-country"
        name="country"
        autoComplete="country"
        defaultValue="DE"
        aria-invalid={isInvalid || undefined}
        aria-describedby={isInvalid ? "checkout-country-error" : undefined}
        className={cn(inputClass, "mt-2 cursor-pointer")}
      >
        {countries.map(({ code, name }) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
      {isInvalid && (
        <p
          id="checkout-country-error"
          className="mt-1.5 text-sm text-red-600 dark:text-red-400"
        >
          {t("errors.country")}
        </p>
      )}
    </div>
  )
}

function PaymentMethods({ methods }: { methods: PaymentMethod[] }) {
  const t = useTranslations("Checkout.payment")

  return (
    <fieldset>
      <legend className="text-lg font-medium tracking-tight text-neutral-900 dark:text-white">
        {t("title")}
      </legend>
      <div className="mt-5 space-y-3">
        {methods.map((method, index) => (
          <label
            key={method}
            className="flex cursor-pointer gap-4 rounded-xl border border-neutral-200 p-4 has-[:checked]:border-neutral-900 dark:border-neutral-800 dark:has-[:checked]:border-white"
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method}
              defaultChecked={index === 0}
              className="mt-1 accent-neutral-900 dark:accent-white"
            />
            <span>
              <span className="block text-[15px] font-medium text-neutral-900 dark:text-white">
                {t(`methods.${method}.label`)}
              </span>
              <span className="mt-1 block text-sm text-neutral-600 dark:text-neutral-400">
                {t(`methods.${method}.description`)}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function OrderReview({
  cart,
  invalid,
  pending,
}: {
  cart: Summary
  invalid: Set<CheckoutField>
  pending: boolean
}) {
  const t = useTranslations("Checkout")
  const formatCents = useFormatCents()
  const termsInvalid = invalid.has("terms")

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl bg-neutral-100 p-6 sm:p-8 dark:bg-neutral-900">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-medium tracking-tight text-neutral-900 dark:text-white">
            {t("summary.title")}
          </h2>
          <Link
            href="/cart"
            className="text-sm text-neutral-600 underline-offset-4 hover:text-neutral-900 hover:underline dark:text-neutral-400 dark:hover:text-white"
          >
            {t("summary.edit")}
          </Link>
        </div>

        <ul className="mt-6 space-y-3 border-b border-neutral-200 pb-6 text-sm dark:border-neutral-800">
          {cart.lines.map((line) => (
            <li key={line.variantId} className="flex justify-between gap-4">
              <span className="min-w-0 text-neutral-900 dark:text-white">
                {line.quantity} × {line.variant.product.name}{" "}
                <span className="text-neutral-500">{line.variant.label}</span>
                {line.quantity > line.variant.stock && (
                  <span className="block text-red-600 dark:text-red-400">
                    {line.variant.stock === 0
                      ? t("stock.soldOut")
                      : t("stock.limited", { count: line.variant.stock })}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-neutral-900 tabular-nums dark:text-white">
                {formatCents(line.totalCents)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <OrderTotals {...cart} />
        </div>

        <div className="mt-6">
          <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              name="terms"
              required
              aria-invalid={termsInvalid || undefined}
              aria-describedby={
                termsInvalid ? "checkout-terms-error" : undefined
              }
              className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-neutral-900 dark:accent-white"
            />
            <span>
              {t.rich("terms", {
                agb: (chunks) => (
                  <Link href="/agb" target="_blank" className="underline">
                    {chunks}
                  </Link>
                ),
                widerruf: (chunks) => (
                  <Link href="/widerruf" target="_blank" className="underline">
                    {chunks}
                  </Link>
                ),
              })}
            </span>
          </label>
          {termsInvalid && (
            <p
              id="checkout-terms-error"
              className="mt-1.5 text-sm text-red-600 dark:text-red-400"
            >
              {t("errors.terms")}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending || cart.hasStockIssue}
          className="mt-6 flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
        >
          {pending ? t("submitting") : t("submit")}
        </button>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-neutral-500">
        {t("ruoNotice")}
      </p>
    </aside>
  )
}

function EmptyCheckout() {
  const t = useTranslations("Cart.empty")

  return (
    <div className="mt-10 flex flex-col items-center gap-5 rounded-2xl bg-neutral-100 px-6 py-20 text-center dark:bg-neutral-900">
      <div>
        <p className="text-lg font-medium text-neutral-900 dark:text-white">
          {t("title")}
        </p>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {t("body")}
        </p>
      </div>
      <Link
        href="/shop"
        className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-7 py-3.5 font-mono text-[11px] font-medium tracking-[0.12em] text-white uppercase hover:bg-neutral-800 sm:text-xs dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {t("cta")}
      </Link>
    </div>
  )
}
