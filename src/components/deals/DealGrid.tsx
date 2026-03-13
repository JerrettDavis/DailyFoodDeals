import { DealCard } from "./DealCard";
import type { DealWithRelations } from "@/types";

interface DealGridProps {
  deals: DealWithRelations[];
  showStatus?: boolean;
  emptyMessage?: string;
}

export function DealGrid({ deals, showStatus = false, emptyMessage = "No deals found." }: DealGridProps) {
  if (deals.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🍽️</div>
        <p className="text-gray-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} showStatus={showStatus} />
      ))}
    </div>
  );
}
