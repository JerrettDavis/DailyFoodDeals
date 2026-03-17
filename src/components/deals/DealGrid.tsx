import { DealCard } from "./DealCard";
import type { ResolvedDeal } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { SparklesIcon } from "@/components/ui/icons";

interface DealGridProps {
  deals: ResolvedDeal[];
  showStatus?: boolean;
  emptyMessage?: string;
  detailHrefSuffix?: string;
}

export function DealGrid({
  deals,
  showStatus = false,
  emptyMessage = "No deals found.",
  detailHrefSuffix = "",
}: DealGridProps) {
  if (deals.length === 0) {
    return (
      <EmptyState
        icon={<SparklesIcon size={22} />}
        title="Nothing matched this filter set"
        description={emptyMessage}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} showStatus={showStatus} detailHrefSuffix={detailHrefSuffix} />
      ))}
    </div>
  );
}
