import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
  {
    variants: {
      variant: {
        default: "bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-200",
        outline: "bg-white text-zinc-700 ring-1 ring-inset ring-zinc-200",
        available: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
        unavailable: "bg-zinc-100 text-zinc-500 ring-1 ring-inset ring-zinc-200",
        car: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
        motorbike: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
        pending: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
        confirmed: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
        completed: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
        cancelled: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
