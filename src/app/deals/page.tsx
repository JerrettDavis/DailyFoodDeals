import { Suspense } from "react";
import { DealFilters } from "@/components/deals/DealFilters";
import { DealGrid } from "@/components/deals/DealGrid";
import { DealsMapLazy } from "@/components/deals/DealsMapLazy";
import { DealSearch } from "@/components/deals/DealSearch";
import { MapViewToggle } from "@/components/deals/MapViewToggle";
import { DeploymentStatusNotice } from "@/components/system/DeploymentStatusNotice";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { MapIcon, SparklesIcon } from "@/components/ui/icons";
import { getPublicDeals } from "@/lib/public-deals";
import { getRestaurantMapsHref, hasCoordinates } from "@/lib/utils";
import { usePublicFallbackData } from "@/lib/runtime-config";

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
    view?: string;
  }>;
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const resolvedParams = await searchParams;
  const deals = await getPublicDeals(resolvedParams);
  const mapPoints = deals.reduce<
    {
      id: string;
      title: string;
      restaurantName: string;
      priceInfo: string | null;
      latitude: number;
      longitude: number;
      href: string;
      mapsHref: string;
    }[]
  >((points, deal) => {
    if (!hasCoordinates(deal.restaurant)) {
      return points;
    }

    points.push({
      id: deal.id,
      title: deal.title,
      restaurantName: deal.restaurant.name,
      priceInfo: deal.priceInfo,
      latitude: deal.restaurant.latitude,
      longitude: deal.restaurant.longitude,
      href: `/deals/${deal.id}`,
      mapsHref: getRestaurantMapsHref(deal.restaurant),
    });

    return points;
  }, []);
  const showMap = resolvedParams.view === "map";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        eyebrow="Explore the feed"
        title="Browse Deals"
        description="Find the best food deals in your area, switch into a map view when you want location context, and narrow the list without losing momentum."
        actions={<MapViewToggle disabled={mapPoints.length === 0} />}
      />

      {usePublicFallbackData ? (
        <DeploymentStatusNotice
          compact
          title="Showing demo deals"
          message="The live runtime database is unavailable right now, so filters and deal details are using built-in sample data."
        />
      ) : null}

      <div className="sticky top-20 z-30 mb-6">
        <Card className="border-white/10 bg-[#0d1118]/90 px-4 py-4 backdrop-blur-xl">
          <Suspense>
            <DealSearch />
          </Suspense>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-4 xl:sticky xl:top-40 xl:self-start">
          <Suspense>
            <DealFilters />
          </Suspense>
        </div>

        <div className="space-y-6">
          <Card className="p-4 sm:p-5" variant="muted">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Results</p>
                <p className="mt-1 text-lg font-semibold text-white">{deals.length} deals found</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-300">
                {showMap ? <MapIcon size={16} className="text-orange-300" /> : <SparklesIcon size={16} className="text-orange-300" />}
                {showMap ? "Map and list together" : "List-first browsing"}
              </div>
            </div>
          </Card>

          {showMap ? (
            <div className="space-y-4">
              <PageHeader
                eyebrow="Map view"
                title="See the feed on a map"
                description="Use the map to get neighborhood context, then jump straight into the deal detail when one looks worth the stop."
                className="mb-0"
              />
              <DealsMapLazy points={mapPoints} heightClassName="h-[440px]" />
            </div>
          ) : null}

          <DealGrid deals={deals} emptyMessage="No deals match your filters. Try adjusting your search or using fewer refinements." />
        </div>
      </div>
    </div>
  );
}
