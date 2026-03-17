import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition focus:border-orange-400/70 focus:ring-4 focus:ring-orange-500/10",
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
