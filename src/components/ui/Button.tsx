import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  const variants = {
    primary:
      "bg-orange-500 text-white shadow-[0_18px_30px_-18px_rgba(249,115,22,0.9)] hover:bg-orange-400",
    secondary:
      "bg-white/[0.05] text-white hover:bg-white/[0.08] border border-white/10",
    ghost:
      "bg-transparent text-gray-300 hover:bg-white/[0.05] hover:text-white",
    danger: "bg-red-500/90 text-white hover:bg-red-400",
    outline:
      "border border-orange-500/25 bg-orange-500/10 text-orange-100 hover:border-orange-400/40 hover:bg-orange-500/15",
  };

  const sizes = {
    sm: "h-10 rounded-xl px-3.5 text-sm",
    md: "h-11 rounded-xl px-4.5 text-sm",
    lg: "h-12 rounded-2xl px-6 text-base",
  };

  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0d12]",
    variants[variant ?? "primary"],
    sizes[size ?? "md"],
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
