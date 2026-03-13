import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getDayName, formatTime } from "@/lib/utils";
import type { DealWithRelations } from "@/types";

interface DealCardProps {
  deal: DealWithRelations;
  showStatus?: boolean;
}

export function DealCard({ deal, showStatus = false }: DealCardProps) {
  const upvotes = deal.votes.filter((v) => v.voteType === "UP" || v.voteType === "CONFIRM").length;
  const schedule = deal.schedules[0];

  return (
    <Link href={`/deals/${deal.id}`}>
      <Card className="hover:border-orange-500/50 transition-all cursor-pointer group h-full">
        <div className="p-5 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-white group-hover:text-orange-500 transition-colors text-lg leading-tight">
                {deal.title}
              </h3>
              <p className="text-gray-400 text-sm mt-1">{deal.restaurant.name}</p>
            </div>
            <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
              {deal.verified && <Badge variant="verified">✓ Verified</Badge>}
              {showStatus && (
                <Badge variant={
                  deal.status === "APPROVED" ? "approved" :
                  deal.status === "PENDING" ? "pending" : "rejected"
                }>{deal.status}</Badge>
              )}
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{deal.description}</p>

          <div className="space-y-2">
            {deal.priceInfo && (
              <div className="text-orange-400 font-semibold text-lg">{deal.priceInfo}</div>
            )}

            {schedule && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>📅</span>
                <span>{getDayName(schedule.dayOfWeek)}</span>
                <span>·</span>
                <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mt-2">
              {deal.cuisineType && <Badge variant="cuisine">{deal.cuisineType}</Badge>}
              {deal.category && <Badge variant="category">{deal.category}</Badge>}
              {deal.kidFriendly && <Badge>👶 Kids OK</Badge>}
              {deal.kidsEatFree && <Badge>🆓 Kids Eat Free</Badge>}
              {deal.vegetarianFriendly && <Badge>🥗 Vegetarian</Badge>}
              {deal.lateNight && <Badge>🌙 Late Night</Badge>}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-800">
              <div className="flex gap-3 text-sm text-gray-500">
                {deal.dineIn && <span>🍽️ Dine In</span>}
                {deal.toGo && <span>🥡 To Go</span>}
              </div>
              {upvotes > 0 && (
                <span className="text-sm text-green-400">👍 {upvotes}</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
