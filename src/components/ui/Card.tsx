import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "interactive";
}

export function Card({ children, className, variant = "default", ...props }: CardProps) {
  const variants = {
    default:
      "border border-white/10 bg-white/[0.04] shadow-[0_24px_60px_-32px_rgba(15,23,42,0.8)] backdrop-blur-sm",
    muted: "border border-white/8 bg-white/[0.025]",
    interactive:
      "border border-white/10 bg-white/[0.04] shadow-[0_24px_60px_-32px_rgba(15,23,42,0.8)] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-400/35 hover:bg-white/[0.055]",
  };

  return (
    <div className={cn("overflow-hidden rounded-3xl", variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
