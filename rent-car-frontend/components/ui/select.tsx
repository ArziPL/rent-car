import * as React from "react";
import { cn } from "@/lib/utils";

// Native <select> styled to look like shadcn/ui — no Radix required for simple use cases.
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-9 w-full appearance-none rounded-md border border-zinc-200 bg-white px-3 pr-8 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
          // chevron arrow via background image
          "bg-[url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='rgb(113,113,122)' d='M0 0h10L5 6z'/%3E%3C/svg%3E\")] bg-[length:10px_6px] bg-[right_10px_center] bg-no-repeat",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
