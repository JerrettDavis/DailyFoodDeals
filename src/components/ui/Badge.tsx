import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "verified" | "pending" | "rejected" | "approved" | "default" | "cuisine" | "category";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  const variants = {
    verified: "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
    pending: "border border-amber-400/20 bg-amber-500/10 text-amber-100",
    rejected: "border border-red-400/20 bg-red-500/10 text-red-100",
    approved: "border border-sky-400/20 bg-sky-500/10 text-sky-100",
    default: "border border-white/10 bg-white/[0.05] text-gray-300",
    cuisine: "border border-orange-400/20 bg-orange-500/10 text-orange-100",
    category: "border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-100",
  };
  const sizes = {
    sm: "px-2.5 py-1 text-[11px]",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium uppercase tracking-[0.16em]",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
