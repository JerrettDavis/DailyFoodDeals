import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DealGrid } from "@/components/deals/DealGrid";
import { DeploymentStatusNotice } from "@/components/system/DeploymentStatusNotice";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { BookmarkIcon, SparklesIcon } from "@/components/ui/icons";
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
          schedules: {
            orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
          },
          votes: true,
          favorites: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const deals = favorites.map((favorite) => favorite.deal) as DealWithRelations[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        eyebrow="Saved for later"
        title="My Favorites"
        description="Your personal shortlist of lunch backups, family go-tos, and deals worth revisiting."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="p-5" variant="muted">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-300">
            <BookmarkIcon size={18} />
          </div>
          <p className="mt-4 text-sm uppercase tracking-[0.2em] text-gray-500">Saved deals</p>
          <p className="mt-2 text-2xl font-semibold text-white">{deals.length}</p>
        </Card>
        <Card className="p-5" variant="muted">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-300">
            <SparklesIcon size={18} />
          </div>
          <p className="mt-4 text-sm uppercase tracking-[0.2em] text-gray-500">Use case</p>
          <p className="mt-2 text-lg font-semibold text-white">Plan faster</p>
        </Card>
      </div>

      <DealGrid
        deals={deals}
        emptyMessage="You haven't saved any deals yet. Browse deals to start building your own shortlist."
      />
    </div>
  );
}
