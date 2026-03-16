import { DealGrid } from "@/components/deals/DealGrid";
import { DealFilters } from "@/components/deals/DealFilters";
import { DealSearch } from "@/components/deals/DealSearch";
import { DeploymentStatusNotice } from "@/components/system/DeploymentStatusNotice";
import { getPublicDeals } from "@/lib/public-deals";
import { usePublicFallbackData } from "@/lib/runtime-config";
import { Suspense } from "react";

interface DealsPageProps {
  searchParams: Promise<{
    day?: string;
    cuisine?: string;
    category?: string;
    kidFriendly?: string;
    verified?: string;
    search?: string;
    dineIn?: string;
    toGo?: string;
  }>;
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const resolvedParams = await searchParams;
  const deals = await getPublicDeals(resolvedParams);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Browse Deals</h1>
        <p className="text-gray-400">Find the best food deals in your area</p>
      </div>

      {usePublicFallbackData && (
        <DeploymentStatusNotice
          compact
          title="Showing demo deals"
          message="The live runtime database is unavailable right now, so filters and deal details are using built-in sample data."
        />
      )}

      {/* Sticky search */}
      <div className="sticky top-16 z-40 bg-gray-950 py-3 mb-6 -mx-4 px-4 border-b border-gray-800">
        <Suspense>
          <DealSearch />
        </Suspense>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64 flex-shrink-0">
          <Suspense>
            <DealFilters />
          </Suspense>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">{deals.length} deals found</p>
          </div>
          <DealGrid deals={deals} emptyMessage="No deals match your filters. Try adjusting your search!" />
        </div>
      </div>
    </div>
  );
}
