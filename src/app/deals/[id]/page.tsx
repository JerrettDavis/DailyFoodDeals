import Link from "next/link";
import { notFound } from "next/navigation";
import { suggestLocationParticipation } from "@/actions/deals";
import { auth } from "@/lib/auth";
import { getPublicDealById } from "@/lib/public-deals";
import { canUseRuntimeAuth, hasRuntimeDatabase, usePublicFallbackData } from "@/lib/runtime-config";
import {
  DEAL_OPTION_FIELDS,
  formatDistanceMiles,
  formatTime,
  getDayName,
  getRestaurantAddress,
  getRestaurantMapsHref,
  getSafeExternalHref,
} from "@/lib/utils";
import { DealsMapLazy } from "@/components/deals/DealsMapLazy";
import { UseMyLocationButton } from "@/components/deals/UseMyLocationButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DeploymentStatusNotice } from "@/components/system/DeploymentStatusNotice";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  GlobeIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/ui/icons";
import { FavoriteButton } from "./FavoriteButton";
import { VoteButtons } from "./VoteButtons";

interface DealDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    lat?: string;
    lng?: string;
    success?: string;
    error?: string;
  }>;
}

export default async function DealDetailPage({ params, searchParams }: DealDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const [deal, session] = await Promise.all([
    getPublicDealById(id, resolvedSearchParams),
    canUseRuntimeAuth ? auth() : Promise.resolve(null),
  ]);

  if (!deal || deal.status !== "APPROVED") notFound();

  const canUseInteractiveFeatures = canUseRuntimeAuth && hasRuntimeDatabase && !usePublicFallbackData;
  const isFavorited = session?.user?.id ? deal.favorites.some((favorite) => favorite.userId === session.user.id) : false;
  const userVote = session?.user?.id
    ? (deal.votes.find((vote) => vote.userId === session.user.id)?.voteType as
        | "UP"
        | "DOWN"
        | "CONFIRM"
        | "EXPIRED"
        | undefined)
    : undefined;
  const upvotes = deal.votes.filter((vote) => vote.voteType === "UP" || vote.voteType === "CONFIRM").length;
  const downvotes = deal.votes.filter((vote) => vote.voteType === "DOWN" || vote.voteType === "EXPIRED").length;
  const activeFeatures = DEAL_OPTION_FIELDS.filter(({ name }) => Boolean(deal[name]));
  const displayWebsiteHref = getSafeExternalHref(deal.displayRestaurant.website ?? deal.displayBrand?.website ?? null);
  const canSuggestParticipation =
    canUseInteractiveFeatures &&
    !!session?.user?.id &&
    deal.isAllLocationsDeal &&
    session.user.role !== "ADMIN" &&
    session.user.role !== "OWNER";
  const mapPoints = deal.participatingLocations
    .filter((location) => typeof location.restaurant.latitude === "number" && typeof location.restaurant.longitude === "number")
    .map((location) => ({
      id: `${deal.id}:${location.restaurant.id}`,
      title: deal.title,
      restaurantName: location.restaurant.name,
      priceInfo: deal.priceInfo,
      distanceLabel: formatDistanceMiles(location.distanceMiles),
      isSampleData: deal.sampleDataActive,
      latitude: location.restaurant.latitude as number,
      longitude: location.restaurant.longitude as number,
      href: `/deals/${deal.id}`,
      mapsHref: getRestaurantMapsHref(location.restaurant),
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {usePublicFallbackData || deal.sampleDataActive ? (
        <DeploymentStatusNotice
          compact
          title={usePublicFallbackData ? "Demo mode" : "Sample data"}
          message={
            usePublicFallbackData
              ? "This deal is being served from built-in sample data because the live runtime database is unavailable."
              : "This record is marked as sample data so it can be clearly distinguished from live community content."
          }
        />
      ) : null}

      {resolvedSearchParams.success ? (
        <DeploymentStatusNotice compact title="Participation note submitted" message={resolvedSearchParams.success} />
      ) : null}
      {resolvedSearchParams.error ? (
        <DeploymentStatusNotice compact title="Couldn't save that note" message={resolvedSearchParams.error} />
      ) : null}

      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link href="/deals" className="hover:text-white">Browse Deals</Link>
        <ChevronRightIcon size={14} />
        <span className="text-gray-300">{deal.title}</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
        <div className="space-y-6">
          <Card className="p-6 sm:p-8">
            <PageHeader
              eyebrow={deal.verified ? "Verified local find" : "Community-submitted offer"}
              title={deal.title}
              description={deal.description}
              className="mb-0"
              actions={
                <div className="flex flex-wrap gap-3">
                  {deal.isAllLocationsDeal ? <UseMyLocationButton /> : null}
                  {canUseInteractiveFeatures ? (
                    <FavoriteButton dealId={deal.id} isFavorited={isFavorited} />
                  ) : (
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                      Saving and voting are temporarily unavailable.
                    </div>
                  )}
                </div>
              }
            />

            <div className="mt-6 flex flex-wrap gap-2">
              {deal.verified ? (
                <Badge variant="verified" size="md">
                  <CheckCircleIcon size={12} />
                  ✓ Verified Deal
                </Badge>
              ) : null}
              {deal.isAllLocationsDeal ? <Badge variant="allLocations" size="md">All Locations</Badge> : null}
              {deal.sampleDataActive ? <Badge variant="sample" size="md">Sample Data</Badge> : null}
              {deal.cuisineType ? <Badge variant="cuisine" size="md">{deal.cuisineType}</Badge> : null}
              {deal.category ? <Badge variant="category" size="md">{deal.category}</Badge> : null}
            </div>

            {deal.priceInfo ? (
              <div className="mt-6 rounded-3xl border border-orange-500/15 bg-orange-500/10 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-orange-200/80">Offer details</p>
                <p className="mt-2 text-2xl font-semibold text-orange-100">{deal.priceInfo}</p>
              </div>
            ) : null}

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <Card variant="muted" className="p-5">
                <div className="flex items-center gap-2 text-white">
                  <MapPinIcon size={18} className="text-orange-300" />
                  <h2 className="text-lg font-semibold">
                    {deal.isAllLocationsDeal
                      ? deal.locationCount > 0
                        ? "Nearest participating location"
                        : "No currently participating locations"
                      : "Restaurant"}
                  </h2>
                </div>
                <div className="mt-4 space-y-2 text-sm leading-6 text-gray-300">
                  <p className="font-medium text-white">{deal.displayRestaurant.name}</p>
                  <p>{getRestaurantAddress(deal.displayRestaurant)}</p>
                  {deal.isAllLocationsDeal && deal.locationCount === 0 ? (
                    <p className="text-rose-200">
                      This deal is still listed, but every tracked location is currently marked as non-participating.
                    </p>
                  ) : null}
                  {deal.nearestLocation && deal.nearestLocation.distanceMiles !== null ? (
                    <p className="text-emerald-200">{formatDistanceMiles(deal.nearestLocation.distanceMiles)}</p>
                  ) : null}
                  {deal.displayRestaurant.phone ? (
                    <p className="inline-flex items-center gap-2">
                      <PhoneIcon size={15} className="text-orange-300" />
                      {deal.displayRestaurant.phone}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <a
                      href={getRestaurantMapsHref(deal.displayRestaurant)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-orange-200 hover:text-white"
                    >
                      Open in Maps
                      <ExternalLinkIcon size={14} />
                    </a>
                    {displayWebsiteHref ? (
                      <a
                        href={displayWebsiteHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-orange-200 hover:text-white"
                      >
                        <GlobeIcon size={14} />
                        Visit Website
                      </a>
                    ) : null}
                  </div>
                </div>
              </Card>

              <Card variant="muted" className="p-5">
                <div className="flex items-center gap-2 text-white">
                  <CalendarIcon size={18} className="text-orange-300" />
                  <h2 className="text-lg font-semibold">Schedule</h2>
                </div>
                <div className="mt-4 space-y-3 text-sm text-gray-300">
                  {deal.schedules.map((schedule) => (
                    <div key={schedule.id} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="font-medium text-white">{getDayName(schedule.dayOfWeek)}</p>
                      <p className="mt-1 text-gray-400">{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {deal.isAllLocationsDeal ? (
              <Card variant="muted" className="mt-6 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">Participating locations</h2>
                  <Badge variant="approved">{deal.locationCount} participating</Badge>
                  {deal.nonParticipatingLocations.length > 0 ? (
                    <Badge variant="locationState">{deal.nonParticipatingLocations.length} excluded</Badge>
                  ) : null}
                </div>
                <div className="mt-4 space-y-3">
                  {deal.participatingLocations.map((location) => (
                    <div
                      key={`${deal.id}:${location.restaurant.id}`}
                      className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-white">{location.restaurant.name}</p>
                            {location.isNearest ? <Badge variant="approved">Nearest</Badge> : null}
                          </div>
                          <p className="mt-1 text-sm text-gray-400">{getRestaurantAddress(location.restaurant)}</p>
                          {location.distanceMiles !== null ? (
                            <p className="mt-2 text-sm text-emerald-200">{formatDistanceMiles(location.distanceMiles)}</p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <a
                            href={getRestaurantMapsHref(location.restaurant)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-orange-200 hover:text-white"
                          >
                            Open in Maps
                            <ExternalLinkIcon size={14} />
                          </a>
                          {canSuggestParticipation ? (
                            <form action={suggestLocationParticipation}>
                              <input type="hidden" name="dealId" value={deal.id} />
                              <input type="hidden" name="restaurantId" value={location.restaurant.id} />
                              <input type="hidden" name="requestedStatus" value="NON_PARTICIPATING" />
                              <Button type="submit" size="sm" variant="secondary">
                                Flag non-participating
                              </Button>
                            </form>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            {deal.isAllLocationsDeal && deal.nonParticipatingLocations.length > 0 ? (
              <Card variant="muted" className="mt-6 p-5">
                <h2 className="text-lg font-semibold text-white">Currently not participating</h2>
                <div className="mt-4 space-y-3">
                  {deal.nonParticipatingLocations.map((location) => (
                    <div
                      key={`${deal.id}:${location.restaurant.id}:excluded`}
                      className="rounded-2xl border border-rose-500/10 bg-rose-500/[0.06] px-4 py-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-white">{location.restaurant.name}</p>
                        <Badge variant="locationState">Not participating</Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-300">{getRestaurantAddress(location.restaurant)}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            <Card variant="muted" className="mt-6 p-5">
              <h2 className="text-lg font-semibold text-white">What to know</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {activeFeatures.map((feature) => (
                  <div key={feature.name} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-gray-200">
                    {feature.label}
                  </div>
                ))}
              </div>
            </Card>

            <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              {canUseInteractiveFeatures ? (
                <VoteButtons dealId={deal.id} upvotes={upvotes} downvotes={downvotes} userVote={userVote} />
              ) : (
                <div className="text-sm text-amber-200">Community interactions will return once runtime services are configured.</div>
              )}
              <div className="text-sm text-gray-500">
                Added {new Date(deal.createdAt).toLocaleDateString()}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <Card className="p-5" variant="muted">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Location preview</p>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              {deal.isAllLocationsDeal
                ? "This map shows participating locations for the deal so you can pick the closest valid stop."
                : "Get immediate neighborhood context, then jump into your preferred maps app when it&apos;s time to go."}
            </p>
          </Card>
          <DealsMapLazy points={mapPoints} heightClassName="h-[360px]" />
        </div>
      </div>
    </div>
  );
}
