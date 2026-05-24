import { Badge } from "@/components/ui/badge";
import type { ReservationStatus } from "@/types/api";

const STATUS_CONFIG: Record<
  ReservationStatus,
  { dot: string; variant: "pending" | "confirmed" | "completed" | "cancelled" }
> = {
  PENDING: { dot: "bg-amber-500", variant: "pending" },
  CONFIRMED: { dot: "bg-emerald-500", variant: "confirmed" },
  COMPLETED: { dot: "bg-sky-500", variant: "completed" },
  CANCELLED: { dot: "bg-rose-500", variant: "cancelled" },
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Badge variant={cfg.variant}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}
