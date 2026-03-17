import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CheckCircleIcon, ClockIcon, MapPinIcon } from "@/components/ui/icons";
import {
  formatCompactNumber,
  formatDistanceMiles,
  formatTime,
  getDayName,
  getRestaurantAddress,
  hasCoordinates,
} from "@/lib/utils";
import type { ResolvedDeal } from "@/types";

interface DealCardProps {
  deal: ResolvedDeal;
  showStatus?: boolean;
  detailHrefSuffix?: string;
}

export function DealCard({ deal, showStatus = false, detailHrefSuffix = "" }: DealCardProps) {
  const upvotes = deal.votes.filter((vote) => vote.voteType === "UP" || vote.voteType === "CONFIRM").length;
  const schedule = [...deal.schedules].sort(
    (left, right) => left.dayOfWeek - right.dayOfWeek || left.startTime.localeCompare(right.startTime)
  )[0];

  return (
    <Link href={`/deals/${deal.id}${detailHrefSuffix}`} className="group block h-full" aria-label={deal.title}>
      <Card className="h-full p-5" variant="interactive">
        <div className="flex h-full flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {deal.verified ? (
                  <Badge variant="verified">
                    <CheckCircleIcon size={12} />
                    Verified
                  </Badge>
                ) : null}
                {deal.isAllLocationsDeal ? <Badge variant="allLocations">All Locations</Badge> : null}
                {deal.sampleDataActive ? <Badge variant="sample">Sample Data</Badge> : null}
                {deal.cuisineType ? <Badge variant="cuisine">{deal.cuisineType}</Badge> : null}
                {deal.category ? <Badge variant="category">{deal.category}</Badge> : null}
                {showStatus ? (
                  <Badge
                    variant={
                      deal.status === "APPROVED"
                        ? "approved"
                        : deal.status === "PENDING"
                          ? "pending"
                          : "rejected"
                    }
                  >
                    {deal.status}
                  </Badge>
                ) : null}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight text-white transition-colors group-hover:text-orange-200">
                  {deal.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                  <span className="font-medium text-gray-200">
                    {deal.displayBrand?.name ?? deal.displayRestaurant.name}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span>
                    {deal.displayRestaurant.city}, {deal.displayRestaurant.state}
                  </span>
                  {deal.isAllLocationsDeal ? (
                    <>
                      <span className="text-gray-600">•</span>
                      <span>{deal.locationCount} participating locations</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {upvotes > 0 ? (
              <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-3 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">Community</p>
                <p className="mt-1 text-sm font-semibold text-emerald-100">{formatCompactNumber(upvotes)} upvotes</p>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <p className="line-clamp-3 text-sm leading-6 text-gray-400">{deal.description}</p>
            {deal.priceInfo ? <p className="text-lg font-semibold text-orange-200">{deal.priceInfo}</p> : null}
          </div>

          <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
            {schedule ? (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <ClockIcon size={16} className="text-orange-300" />
                <span>{getDayName(schedule.dayOfWeek)}</span>
                <span className="text-gray-600">•</span>
                <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
              </div>
            ) : null}

            <div className="flex items-start gap-2 text-sm text-gray-400">
              <MapPinIcon size={16} className="mt-0.5 text-orange-300" />
              <div>
                <p className="line-clamp-2">{getRestaurantAddress(deal.displayRestaurant)}</p>
                {deal.isAllLocationsDeal ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-violet-200/70">
                    {deal.locationCount === 0
                      ? "No locations currently participating"
                      : deal.nearestLocation && deal.nearestLocation.distanceMiles !== null
                      ? `Nearest participating location • ${formatDistanceMiles(deal.nearestLocation.distanceMiles)}`
                      : `${deal.locationCount} locations participating`}
                  </p>
                ) : null}
                {deal.nonParticipatingLocations.length > 0 ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-rose-200/70">
                    {deal.nonParticipatingLocations.length} location
                    {deal.nonParticipatingLocations.length === 1 ? "" : "s"} excluded
                  </p>
                ) : null}
                {hasCoordinates(deal.displayRestaurant) ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-emerald-200/70">Map ready</p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {deal.dineIn ? <Badge>Dine In</Badge> : null}
              {deal.toGo ? <Badge>To Go</Badge> : null}
              {deal.kidFriendly ? <Badge>Kid Friendly</Badge> : null}
              {deal.kidsEatFree ? <Badge>Kids Eat Free</Badge> : null}
              {deal.vegetarianFriendly ? <Badge>Vegetarian</Badge> : null}
              {deal.lateNight ? <Badge>Late Night</Badge> : null}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
