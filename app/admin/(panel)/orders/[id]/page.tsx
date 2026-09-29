import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import * as z from "zod"

import { OrderActions } from "@/components/admin/order-actions"
import { ResendEmailButton } from "@/components/admin/resend-email-button"
import { STATUS_LABELS, StatusBadge } from "@/components/admin/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requireAdmin } from "@/lib/admin/auth"
import { formatCents, formatDateTime } from "@/lib/admin/format"
import { orderReference, trackingUrl } from "@/lib/orders"
import { createAdminClient } from "@/lib/supabase/admin"

type Params = Promise<{ id: string }>

const EMAIL_LABELS = {
  received: "Order received",
  paid: "Payment received",
  shipped: "Shipped",
  cancelled: "Cancelled",
} as const

const addressSchema = z.object({
  name: z.string(),
  street: z.string(),
  zip: z.string(),
  city: z.string(),
  country: z.string(),
  phone: z.string().optional(),
})
type Address = z.infer<typeof addressSchema>

async function getOrder(id: string) {
  if (!z.uuid().safeParse(id).success) return null
  const { data, error } = await createAdminClient()
    .from("orders")
    .select(
      "*, order_items (id, product_name, variant_label, sku, unit_price_cents, qty, line_total_cents), order_events (id, from_status, to_status, actor, note, created_at), order_emails (id, kind, recipient, sent, error, created_at)"
    )
    .eq("id", id)
    .order("created_at", { referencedTable: "order_events" })
    .order("created_at", { referencedTable: "order_emails" })
    .maybeSingle()
  if (error) throw error
  return data
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  await requireAdmin()
  const order = await getOrder((await params).id)
  return { title: order ? orderReference(order.number) : "Order" }
}

/** "admin:<uuid>" → the admin's email, for the timeline. */
async function actorNames(actors: string[]) {
  const ids = [
    ...new Set(
      actors.filter((a) => a.startsWith("admin:")).map((a) => a.slice(6))
    ),
  ]
  const auth = createAdminClient().auth.admin
  const entries = await Promise.all(
    ids.map(async (id) => {
      const { data } = await auth.getUserById(id)
      return [`admin:${id}`, data.user?.email ?? "Admin"] as const
    })
  )
  return new Map<string, string>([
    ["customer", "Customer"],
    ["system", "System"],
    ...entries,
  ])
}

export default async function OrderPage({ params }: { params: Params }) {
  await requireAdmin()
  const order = await getOrder((await params).id)
  if (!order) notFound()

  const billing = addressSchema.safeParse(order.billing).data
  const shipping = addressSchema.safeParse(order.shipping).data
  const sameAddress = JSON.stringify(billing) === JSON.stringify(shipping)
  const actors = await actorNames(order.order_events.map((e) => e.actor))

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/orders"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Orders
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">
            {orderReference(order.number)}
          </h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Placed {formatDateTime(order.created_at)} · Bank transfer ·{" "}
          {order.locale.toUpperCase()}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.order_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.product_name}{" "}
                        <span className="text-muted-foreground">
                          {item.variant_label}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {item.sku}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.qty}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCents(item.unit_price_cents)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCents(item.line_total_cents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  {[
                    ["Subtotal", order.subtotal_cents],
                    ["Shipping", order.shipping_cents],
                    ["Total", order.total_cents],
                    ["incl. VAT", order.vat_cents],
                  ].map(([label, cents]) => (
                    <TableRow key={label}>
                      <TableCell colSpan={4} className="text-right">
                        {label}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCents(cents as number)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {order.order_events.map((event) => (
                  <li key={event.id} className="text-sm">
                    <div className="font-medium">
                      {event.from_status
                        ? `${STATUS_LABELS[event.from_status]} → ${STATUS_LABELS[event.to_status]}`
                        : `Order placed (${STATUS_LABELS[event.to_status]})`}
                    </div>
                    <div className="text-muted-foreground">
                      {formatDateTime(event.created_at)} ·{" "}
                      {actors.get(event.actor) ?? event.actor}
                    </div>
                    {event.note && <p className="mt-1">{event.note}</p>}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderActions orderId={order.id} status={order.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <a href={`mailto:${order.email}`} className="underline">
                  {order.email}
                </a>
                {billing?.phone && <div>{billing.phone}</div>}
              </div>
              <AddressBlock
                title={
                  sameAddress ? "Billing & delivery address" : "Billing address"
                }
                address={billing}
              />
              {!sameAddress && (
                <AddressBlock title="Delivery address" address={shipping} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emails</CardTitle>
            </CardHeader>
            <CardContent>
              {order.order_emails.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No emails sent yet.
                </p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {order.order_emails.map((email) => (
                    <li key={email.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">
                          {EMAIL_LABELS[email.kind]}
                        </span>
                        <ResendEmailButton
                          orderId={order.id}
                          kind={email.kind}
                        />
                      </div>
                      <div
                        className={
                          email.sent
                            ? "text-muted-foreground"
                            : "text-destructive"
                        }
                      >
                        {email.sent ? "Sent" : "Failed"} ·{" "}
                        {formatDateTime(email.created_at)}
                      </div>
                      {email.error && (
                        <div className="text-xs break-words text-destructive">
                          {email.error}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {(order.paid_at || order.shipped_at || order.cancelled_at) && (
            <Card>
              <CardHeader>
                <CardTitle>Fulfilment</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  {order.paid_at && (
                    <>
                      <dt className="text-muted-foreground">Paid</dt>
                      <dd>{formatDateTime(order.paid_at)}</dd>
                    </>
                  )}
                  {order.shipped_at && (
                    <>
                      <dt className="text-muted-foreground">Shipped</dt>
                      <dd>{formatDateTime(order.shipped_at)}</dd>
                    </>
                  )}
                  {order.tracking_number && (
                    <>
                      <dt className="text-muted-foreground">Tracking</dt>
                      <dd>
                        <a
                          href={trackingUrl(order.tracking_number)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono underline"
                        >
                          {order.tracking_number}
                        </a>
                      </dd>
                    </>
                  )}
                  {order.cancelled_at && (
                    <>
                      <dt className="text-muted-foreground">Cancelled</dt>
                      <dd>{formatDateTime(order.cancelled_at)}</dd>
                    </>
                  )}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function AddressBlock({
  title,
  address,
}: {
  title: string
  address: Address | undefined
}) {
  return (
    <div>
      <div className="mb-1 text-muted-foreground">{title}</div>
      {address ? (
        <address className="not-italic">
          {address.name}
          <br />
          {address.street}
          <br />
          {address.zip} {address.city}
          <br />
          {new Intl.DisplayNames(["en"], { type: "region" }).of(
            address.country
          ) ?? address.country}
        </address>
      ) : (
        <span>—</span>
      )}
    </div>
  )
}
