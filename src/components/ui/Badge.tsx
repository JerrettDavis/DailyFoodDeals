import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "verified" | "pending" | "rejected" | "approved" | "default" | "cuisine" | "category";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    verified: "bg-green-500/20 text-green-400 border border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    rejected: "bg-red-500/20 text-red-400 border border-red-500/30",
    approved: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    default: "bg-gray-700 text-gray-300",
    cuisine: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    category: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  };

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
