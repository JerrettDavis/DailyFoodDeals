import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-gray-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition focus:border-orange-400/70 focus:ring-4 focus:ring-orange-500/10",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
