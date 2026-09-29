import { Badge } from "@/components/ui/badge"
import type { Database } from "@/lib/supabase/database.types"

export type OrderStatus = Database["public"]["Enums"]["order_status"]

export const STATUS_LABELS: Record<OrderStatus, string> = {
  awaiting_payment: "Awaiting payment",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
}

const VARIANTS = {
  awaiting_payment: "outline",
  processing: "default",
  shipped: "secondary",
  completed: "secondary",
  cancelled: "destructive",
} as const satisfies Record<OrderStatus, string>

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
}
