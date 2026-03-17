import { Suspense } from "react";
import { DealFilters } from "@/components/deals/DealFilters";
import { DealGrid } from "@/components/deals/DealGrid";
import { DealsMapLazy } from "@/components/deals/DealsMapLazy";
import { DealSearch } from "@/components/deals/DealSearch";
import { MapViewToggle } from "@/components/deals/MapViewToggle";
import { UseMyLocationButton } from "@/components/deals/UseMyLocationButton";
import { DeploymentStatusNotice } from "@/components/system/DeploymentStatusNotice";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { MapIcon, SparklesIcon } from "@/components/ui/icons";
import { getPublicDeals } from "@/lib/public-deals";
import { formatDistanceMiles, getRestaurantMapsHref, hasCoordinates } from "@/lib/utils";
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
    lat?: string;
    lng?: string;
  }>;
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const resolvedParams = await searchParams;
  const deals = await getPublicDeals(resolvedParams);
  const detailLocationQuery =
    resolvedParams.lat && resolvedParams.lng
      ? `?lat=${encodeURIComponent(resolvedParams.lat)}&lng=${encodeURIComponent(resolvedParams.lng)}`
      : "";

  const mapPoints = deals.reduce<
    {
      id: string;
      title: string;
      restaurantName: string;
      priceInfo: string | null;
      distanceLabel: string | null;
      isSampleData: boolean;
      latitude: number;
      longitude: number;
      href: string;
      mapsHref: string;
    }[]
  >((points, deal) => {
    for (const location of deal.participatingLocations) {
      if (!hasCoordinates(location.restaurant)) {
        continue;
      }

      points.push({
        id: `${deal.id}:${location.restaurant.id}`,
        title: deal.title,
        restaurantName: location.restaurant.name,
        priceInfo: deal.priceInfo,
        distanceLabel: formatDistanceMiles(location.distanceMiles),
        isSampleData: deal.sampleDataActive,
        latitude: location.restaurant.latitude,
        longitude: location.restaurant.longitude,
        href: `/deals/${deal.id}${detailLocationQuery}`,
        mapsHref: getRestaurantMapsHref(location.restaurant),
      });
    }

    return points;
  }, []);
  const showMap = resolvedParams.view === "map";
  const hasSampleData = deals.some((deal) => deal.sampleDataActive);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        eyebrow="Explore the feed"
        title="Browse Deals"
        description="Find the best food deals in your area, switch into a map view when you want location context, and narrow the list without losing momentum."
        actions={
          <>
            <UseMyLocationButton />
            <MapViewToggle disabled={mapPoints.length === 0} />
          </>
        }
      />

      {usePublicFallbackData || hasSampleData ? (
        <DeploymentStatusNotice
          compact
          title={usePublicFallbackData ? "Showing demo deals" : "Some deals are marked as sample data"}
          message={
            usePublicFallbackData
              ? "The live runtime database is unavailable right now, so filters and deal details are using built-in sample data."
              : "Sample-marked records are clearly labeled so you can distinguish demo content from live community data."
          }
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
                {resolvedParams.lat && resolvedParams.lng ? (
                  <p className="mt-2 text-sm text-emerald-200">
                    Sorted by nearest participating location when coordinates are available.
                  </p>
                ) : null}
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
                description="Participating locations show on the map, so all-location deals can point you to the nearest valid stop instead of a generic chain label."
                className="mb-0"
              />
              <DealsMapLazy points={mapPoints} heightClassName="h-[440px]" />
            </div>
          ) : null}

          <DealGrid
            deals={deals}
            detailHrefSuffix={detailLocationQuery}
            emptyMessage="No deals match your filters. Try adjusting your search or using fewer refinements."
          />
        </div>
      </div>
    </div>
  );
}
