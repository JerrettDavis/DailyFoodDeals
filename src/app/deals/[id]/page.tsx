import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { getDayName, formatTime } from "@/lib/utils";
import type { DealWithRelations } from "@/types";
import { VoteButtons } from "./VoteButtons";
import { FavoriteButton } from "./FavoriteButton";

interface DealDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getDeal(id: string): Promise<DealWithRelations | null> {
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      restaurant: true,
      schedules: true,
      votes: true,
      favorites: true,
    },
  });
  return deal as DealWithRelations | null;
}

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  const { id } = await params;
  const [deal, session] = await Promise.all([getDeal(id), auth()]);

  if (!deal || deal.status !== "APPROVED") notFound();

  const isFavorited = session?.user?.id
    ? deal.favorites.some((f) => f.userId === session.user.id)
    : false;

  const userVote = session?.user?.id
    ? deal.votes.find((v) => v.userId === session.user.id)?.voteType as "UP" | "DOWN" | "CONFIRM" | "EXPIRED" | undefined
    : undefined;

  const upvotes = deal.votes.filter((v) => v.voteType === "UP" || v.voteType === "CONFIRM").length;
  const downvotes = deal.votes.filter((v) => v.voteType === "DOWN" || v.voteType === "EXPIRED").length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {deal.verified && <Badge variant="verified">✓ Verified Deal</Badge>}
                {deal.cuisineType && <Badge variant="cuisine">{deal.cuisineType}</Badge>}
                {deal.category && <Badge variant="category">{deal.category}</Badge>}
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{deal.title}</h1>
              <p className="text-orange-400 text-xl font-semibold">{deal.priceInfo}</p>
            </div>
            <FavoriteButton dealId={deal.id} isFavorited={isFavorited} />
          </div>

          {/* Description */}
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">{deal.description}</p>

          {/* Restaurant Info */}
          <div className="bg-gray-800/50 rounded-xl p-5 mb-6">
            <h2 className="font-semibold text-white text-lg mb-3">📍 Restaurant</h2>
            <p className="text-white font-medium">{deal.restaurant.name}</p>
            <p className="text-gray-400">{deal.restaurant.address}</p>
            <p className="text-gray-400">{deal.restaurant.city}, {deal.restaurant.state} {deal.restaurant.zip}</p>
            {deal.restaurant.phone && <p className="text-gray-400 mt-1">📞 {deal.restaurant.phone}</p>}
            {deal.restaurant.website && (
              <a href={deal.restaurant.website} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400 mt-1 block">
                🌐 Visit Website
              </a>
            )}
          </div>

          {/* Schedule */}
          {deal.schedules.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-5 mb-6">
              <h2 className="font-semibold text-white text-lg mb-3">🗓️ Schedule</h2>
              <div className="space-y-2">
                {deal.schedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center gap-3">
                    <span className="text-orange-500 font-medium w-28">{getDayName(schedule.dayOfWeek)}</span>
                    <span className="text-gray-300">{formatTime(schedule.startTime)} – {formatTime(schedule.endTime)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <div className="bg-gray-800/50 rounded-xl p-5 mb-6">
            <h2 className="font-semibold text-white text-lg mb-3">ℹ️ Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {deal.dineIn && <div className="text-gray-300 flex items-center gap-2"><span>✅</span> Dine In</div>}
              {deal.toGo && <div className="text-gray-300 flex items-center gap-2"><span>✅</span> To Go</div>}
              {deal.kidFriendly && <div className="text-gray-300 flex items-center gap-2"><span>✅</span> Kid Friendly</div>}
              {deal.kidsEatFree && <div className="text-gray-300 flex items-center gap-2"><span>✅</span> Kids Eat Free</div>}
              {deal.vegetarianFriendly && <div className="text-gray-300 flex items-center gap-2"><span>✅</span> Vegetarian Friendly</div>}
              {deal.familyFriendly && <div className="text-gray-300 flex items-center gap-2"><span>✅</span> Family Friendly</div>}
              {deal.lateNight && <div className="text-gray-300 flex items-center gap-2"><span>✅</span> Late Night</div>}
              {deal.alcoholAvailable && <div className="text-gray-300 flex items-center gap-2"><span>✅</span> Alcohol Available</div>}
            </div>
          </div>

          {/* Votes */}
          <div className="flex items-center justify-between">
            <VoteButtons dealId={deal.id} upvotes={upvotes} downvotes={downvotes} userVote={userVote} />
            <div className="text-gray-500 text-sm">
              Added {new Date(deal.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
