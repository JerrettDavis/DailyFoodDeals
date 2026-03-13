import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DealGrid } from "@/components/deals/DealGrid";
import type { DealWithRelations } from "@/types";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      deal: {
        include: {
          restaurant: true,
          schedules: true,
          votes: true,
          favorites: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const deals = favorites.map((f) => f.deal) as DealWithRelations[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">My Favorites</h1>
      <p className="text-gray-400 mb-8">Your saved deals</p>
      <DealGrid deals={deals} emptyMessage="You haven't saved any deals yet. Browse deals to save your favorites!" />
    </div>
  );
}
