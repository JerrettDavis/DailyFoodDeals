import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-gray-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition focus:border-orange-400/70 focus:ring-4 focus:ring-orange-500/10",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
