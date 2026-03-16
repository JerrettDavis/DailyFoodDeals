import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DealGrid } from "@/components/deals/DealGrid";
import { DeploymentStatusNotice } from "@/components/system/DeploymentStatusNotice";
import { canUseRuntimeAuth, hasRuntimeDatabase } from "@/lib/runtime-config";
import type { DealWithRelations } from "@/types";

export default async function FavoritesPage() {
  if (!canUseRuntimeAuth || !hasRuntimeDatabase) {
    return (
      <div className="px-4 py-12">
        <DeploymentStatusNotice
          title="Favorites are temporarily unavailable"
          message="This deployment is missing runtime authentication or database configuration, so saved deals can't be loaded right now."
          actionHref="/deals"
          actionLabel="Browse available deals"
        />
      </div>
    );
  }

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
