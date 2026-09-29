import type { Metadata } from "next"
import Link from "next/link"

import {
  STATUS_LABELS,
  StatusBadge,
  type OrderStatus,
} from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requireAdmin } from "@/lib/admin/auth"
import { formatCents, formatDateTime } from "@/lib/admin/format"
import { orderReference } from "@/lib/orders"
import { createAdminClient } from "@/lib/supabase/admin"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Orders" }

const PAGE_SIZE = 50
const STATUSES = Object.keys(STATUS_LABELS) as OrderStatus[]

type SearchParams = Promise<{ status?: string; q?: string; page?: string }>

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  await requireAdmin()
  const params = await searchParams
  const status = STATUSES.find((value) => value === params.status)
  const q = params.q?.trim() ?? ""
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1)

  let query = createAdminClient()
    .from("orders")
    .select("id, number, email, status, total_cents, billing, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (status) query = query.eq("status", status)
  if (q) {
    // "10001", "PRIME-10001" or "#10001" search by number; anything else
    // by email.
    const number = q.match(/^(?:prime-|#)?(\d+)$/i)?.[1]
    query = number
      ? query.eq("number", Number(number))
      : query.ilike("email", `%${q.replace(/[\\%_]/g, "\\$&")}%`)
  }

  const { data: orders, count, error } = await query
  if (error) throw error
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  const href = (next: { status?: string; page?: number }) => {
    const search = new URLSearchParams()
    const nextStatus = "status" in next ? next.status : status
    if (nextStatus) search.set("status", nextStatus)
    if (q) search.set("q", q)
    if (next.page && next.page > 1) search.set("page", String(next.page))
    const string = search.toString()
    return string ? `/admin/orders?${string}` : "/admin/orders"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <form className="flex gap-2" action="/admin/orders">
          {status && <input type="hidden" name="status" value={status} />}
          <Input
            name="q"
            defaultValue={q}
            placeholder="Order number or email"
            aria-label="Search orders"
            className="w-64 bg-background"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      </div>

      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {[undefined, ...STATUSES].map((value) => (
          <Button
            key={value ?? "all"}
            variant={value === status ? "default" : "outline"}
            size="sm"
            nativeButton={false}
            render={<Link href={href({ status: value })} />}
          >
            {value ? STATUS_LABELS[value] : "All"}
          </Button>
        ))}
      </nav>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {orderReference(order.number)}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDateTime(order.created_at)}</TableCell>
                  <TableCell>
                    <div>{addressName(order.billing)}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCents(order.total_cents)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {pages} · {count} orders
          </span>
          <div className="flex gap-2">
            {[
              { label: "Previous", target: page - 1 },
              { label: "Next", target: page + 1 },
            ].map(({ label, target }) => {
              const disabled = target < 1 || target > pages
              return (
                <Button
                  key={label}
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  aria-disabled={disabled}
                  className={cn(disabled && "pointer-events-none opacity-50")}
                  render={<Link href={href({ page: target })} />}
                >
                  {label}
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function addressName(address: unknown) {
  const name = (address as { name?: unknown } | null)?.name
  return typeof name === "string" ? name : "—"
}
