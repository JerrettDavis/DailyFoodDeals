import { redirect } from "next/navigation";
import {
  approveDeal,
  approveParticipationReview,
  markLocationNonParticipating,
  markLocationParticipating,
  rejectDeal,
  rejectParticipationReview,
  setDealSampleState,
  verifyDeal,
} from "@/actions/admin";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  DEAL_SCOPE_ALL_LOCATIONS,
  PARTICIPATION_STATUS_NON_PARTICIPATING,
  resolveDeals,
} from "@/lib/deal-resolver";
import { getManagerBrandIds, isManagerRole } from "@/lib/deal-management";
import { canUseRuntimeAuth, hasRuntimeDatabase } from "@/lib/runtime-config";
import { formatTime, getDayName, getRestaurantAddress } from "@/lib/utils";
import { dealWithRelationsInclude } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DeploymentStatusNotice } from "@/components/system/DeploymentStatusNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  AlertIcon,
  CheckCircleIcon,
  MapPinIcon,
  ShieldIcon,
  SparklesIcon,
} from "@/components/ui/icons";

function getCommunityLabel(
  person: {
    name?: string | null;
    email?: string | null;
  } | null | undefined,
  canSeeCommunityEmails: boolean
) {
  if (!person) return "Community member";
  if (person.name) return person.name;
  if (canSeeCommunityEmails && person.email) return person.email;
  return "Community member";
}

export default async function AdminPage() {
  if (!canUseRuntimeAuth || !hasRuntimeDatabase) {
    return (
      <div className="px-4 py-12">
        <DeploymentStatusNotice
          title="Management tools are temporarily unavailable"
          message="This deployment is missing runtime authentication or database configuration, so moderation tools can't run right now."
          actionHref="/deals"
          actionLabel="Browse available deals"
        />
      </div>
    );
  }

  const session = await auth();
  if (!session?.user?.id || !isManagerRole(session.user.role)) redirect("/");

  const managerBrandIds = await getManagerBrandIds(session.user.id, session.user.role);
  const scopedBrandIds = managerBrandIds ?? [];
  const canSeeCommunityEmails = session.user.role === "ADMIN";
  const managerVisibleUserSelect = canSeeCommunityEmails
    ? { id: true, name: true, email: true, image: true, role: true }
    : { id: true, name: true, image: true, role: true };
  const managementDealInclude = {
    ...dealWithRelationsInclude,
    submittedBy: {
      select: managerVisibleUserSelect,
    },
    participationReviews: {
      include: {
        restaurant: true,
        submittedBy: {
          select: managerVisibleUserSelect,
        },
        reviewedBy: {
          select: managerVisibleUserSelect,
        },
      },
      orderBy: { createdAt: "desc" as const },
    },
  };

  const pendingWhere =
    session.user.role === "ADMIN"
      ? { status: "PENDING" as const }
      : {
          status: "PENDING" as const,
          brandId: { in: scopedBrandIds },
        };
  const needsVerificationWhere =
    session.user.role === "ADMIN"
      ? { status: "APPROVED" as const, verified: false }
      : {
          status: "APPROVED" as const,
          verified: false,
          brandId: { in: scopedBrandIds },
        };
  const reviewsWhere =
    session.user.role === "ADMIN"
      ? { status: "PENDING" as const }
      : {
          status: "PENDING" as const,
          deal: {
            brandId: { in: scopedBrandIds },
          },
        };
  const reportsWhere =
    session.user.role === "ADMIN"
      ? { resolved: false }
      : {
          resolved: false,
          deal: {
            brandId: { in: scopedBrandIds },
          },
        };
  const managedAllLocationDealsWhere =
    session.user.role === "ADMIN"
      ? { scope: DEAL_SCOPE_ALL_LOCATIONS, status: "APPROVED" as const }
      : {
          scope: DEAL_SCOPE_ALL_LOCATIONS,
          status: "APPROVED" as const,
          brandId: { in: scopedBrandIds },
        };

  const [pendingDeals, approvedDeals, reports, rawAllLocationDeals, participationReviews] =
    await Promise.all([
      prisma.deal.findMany({
        where: pendingWhere,
        include: managementDealInclude,
        orderBy: { createdAt: "asc" },
      }),
      prisma.deal.findMany({
        where: needsVerificationWhere,
        include: managementDealInclude,
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.report.findMany({
        where: reportsWhere,
        include: {
          deal: {
            select: {
              title: true,
              brand: { select: { name: true } },
            },
          },
          user: { select: canSeeCommunityEmails ? { name: true, email: true } : { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.deal.findMany({
        where: managedAllLocationDealsWhere,
        include: managementDealInclude,
        orderBy: { createdAt: "desc" },
      }),
      prisma.dealLocationParticipationReview.findMany({
        where: reviewsWhere,
        include: {
          deal: {
            select: {
              id: true,
              title: true,
              brand: { select: { name: true } },
            },
          },
          restaurant: true,
          submittedBy: { select: canSeeCommunityEmails ? { name: true, email: true } : { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const managedAllLocationDeals = resolveDeals(rawAllLocationDeals);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        eyebrow="Moderation workspace"
        title={session.user.role === "OWNER" ? "Owner Management" : "Admin Dashboard"}
        description="Review submissions, verify published offers, and manage participation for chain-wide deals."
      />

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        {[
          { title: "Pending", value: pendingDeals.length, icon: <SparklesIcon size={18} />, tone: "text-amber-100 bg-amber-500/10 border-amber-500/20" },
          { title: "Needs Verification", value: approvedDeals.length, icon: <CheckCircleIcon size={18} />, tone: "text-sky-100 bg-sky-500/10 border-sky-500/20" },
          { title: "Participation Reviews", value: participationReviews.length, icon: <MapPinIcon size={18} />, tone: "text-violet-100 bg-violet-500/10 border-violet-500/20" },
          { title: "Open Reports", value: reports.length, icon: <AlertIcon size={18} />, tone: "text-red-100 bg-red-500/10 border-red-500/20" },
        ].map((stat) => (
          <Card key={stat.title} className="p-5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${stat.tone}`}>
              {stat.icon}
            </div>
            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-gray-500">{stat.title}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
          </Card>
        ))}
      </div>

      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-semibold text-white">Pending Deals</h2>
        {pendingDeals.length === 0 ? (
          <EmptyState
            icon={<SparklesIcon size={22} />}
            title="No pending deals"
            description="Everything in the queue is already handled. New submissions will show up here automatically."
          />
        ) : (
          <div className="space-y-4">
            {pendingDeals.map((deal) => (
              <Card key={deal.id} className="p-5" data-testid={`pending-deal-${deal.id}`}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="pending">Pending</Badge>
                      {deal.scope === DEAL_SCOPE_ALL_LOCATIONS ? <Badge variant="allLocations">All Locations</Badge> : null}
                      {deal.isSampleData ? <Badge variant="sample">Sample Data</Badge> : null}
                      {deal.cuisineType ? <Badge variant="cuisine">{deal.cuisineType}</Badge> : null}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{deal.title}</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {deal.brand?.name ?? deal.restaurant.name} • {deal.restaurant.city}, {deal.restaurant.state}
                      </p>
                    </div>
                    <p className="max-w-3xl text-sm leading-6 text-gray-300">{deal.description}</p>
                    {deal.priceInfo ? <p className="text-sm font-semibold text-orange-200">{deal.priceInfo}</p> : null}
                    {deal.schedules.length > 0 ? (
                      <p className="text-sm text-gray-500">
                        {deal.schedules
                          .map((schedule) => `${getDayName(schedule.dayOfWeek)} ${formatTime(schedule.startTime)}-${formatTime(schedule.endTime)}`)
                          .join(", ")}
                      </p>
                    ) : null}
                    {deal.submittedBy ? (
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                        Submitted by {getCommunityLabel(deal.submittedBy, canSeeCommunityEmails)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {session.user.role === "ADMIN" ? (
                      <form action={setDealSampleState.bind(null, deal.id, !deal.isSampleData)}>
                        <Button type="submit" variant="secondary" className="min-w-32">
                          {deal.isSampleData ? "Mark live" : "Mark sample"}
                        </Button>
                      </form>
                    ) : null}
                    {session.user.role === "ADMIN" ? (
                      <>
                        <form action={approveDeal.bind(null, deal.id)}>
                          <Button type="submit" className="min-w-32">
                            ✓ Approve
                          </Button>
                        </form>
                        <form action={rejectDeal.bind(null, deal.id)}>
                          <Button type="submit" variant="danger" className="min-w-32">
                            ✗ Reject
                          </Button>
                        </form>
                      </>
                    ) : (
                      <Badge variant="pending">Admins approve new deals</Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-semibold text-white">Approved • Needs Verification</h2>
        {approvedDeals.length === 0 ? (
          <EmptyState
            icon={<ShieldIcon size={22} />}
            title="Everything approved is already verified"
            description="You’re caught up. Newly approved deals will show up here until someone verifies them."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {approvedDeals.map((deal) => (
              <Card key={deal.id} className="p-5" data-testid={`verify-deal-${deal.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {deal.scope === DEAL_SCOPE_ALL_LOCATIONS ? <Badge variant="allLocations">All Locations</Badge> : null}
                      {deal.isSampleData ? <Badge variant="sample">Sample Data</Badge> : null}
                    </div>
                    <h3 className="text-lg font-semibold text-white">{deal.title}</h3>
                    <p className="mt-1 text-sm text-gray-400">{deal.brand?.name ?? deal.restaurant.name}</p>
                  </div>
                  {session.user.role === "ADMIN" ? (
                    <div className="flex flex-wrap gap-2">
                      <form action={setDealSampleState.bind(null, deal.id, !deal.isSampleData)}>
                        <Button type="submit" size="sm" variant="secondary">
                          {deal.isSampleData ? "Mark live" : "Mark sample"}
                        </Button>
                      </form>
                      <form action={verifyDeal.bind(null, deal.id)}>
                        <Button type="submit" size="sm">
                          ✓ Verify
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <Badge variant="approved">Admins verify published deals</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-semibold text-white">All-Location Participation</h2>
        {managedAllLocationDeals.length === 0 ? (
          <EmptyState
            icon={<MapPinIcon size={22} />}
            title="No chain-wide deals to manage"
            description="All-location deals will show up here so you can quickly manage which locations participate."
          />
        ) : (
          <div className="space-y-4">
            {managedAllLocationDeals.map((deal) => (
              <Card key={deal.id} className="p-5" data-testid={`location-management-${deal.id}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="allLocations">All Locations</Badge>
                  {deal.sampleDataActive ? <Badge variant="sample">Sample Data</Badge> : null}
                  <Badge variant="approved">{deal.locationCount} participating</Badge>
                  {deal.nonParticipatingLocations.length > 0 ? (
                    <Badge variant="locationState">{deal.nonParticipatingLocations.length} excluded</Badge>
                  ) : null}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">{deal.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{deal.displayBrand?.name ?? deal.displayRestaurant.name}</p>
                {session.user.role === "ADMIN" ? (
                  <div className="mt-4">
                    <form action={setDealSampleState.bind(null, deal.id, !deal.isSampleData)}>
                      <Button type="submit" size="sm" variant="secondary">
                        {deal.isSampleData ? "Mark live" : "Mark sample"}
                      </Button>
                    </form>
                  </div>
                ) : null}
                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  {[...deal.participatingLocations, ...deal.nonParticipatingLocations].map((location) => {
                    const isExcluded = location.status === PARTICIPATION_STATUS_NON_PARTICIPATING;

                    return (
                      <div
                        key={`${deal.id}:${location.restaurant.id}`}
                        className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-white">{location.restaurant.name}</p>
                            <p className="mt-1 text-sm text-gray-400">{getRestaurantAddress(location.restaurant)}</p>
                            {location.notes ? (
                              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-500">{location.notes}</p>
                            ) : null}
                          </div>
                          <Badge variant={isExcluded ? "locationState" : "approved"}>
                            {isExcluded ? "Not participating" : "Participating"}
                          </Badge>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {isExcluded ? (
                            <form action={markLocationParticipating.bind(null, deal.id, location.restaurant.id)}>
                              <Button type="submit" size="sm">
                                Restore participating
                              </Button>
                            </form>
                          ) : (
                            <form action={markLocationNonParticipating.bind(null, deal.id, location.restaurant.id)}>
                              <Button type="submit" size="sm" variant="secondary">
                                Mark not participating
                              </Button>
                            </form>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-semibold text-white">Participation Reviews</h2>
        {participationReviews.length === 0 ? (
          <EmptyState
            icon={<CheckCircleIcon size={22} />}
            title="No pending participation reviews"
            description="Community-submitted location corrections will show up here for approval."
          />
        ) : (
          <div className="space-y-4">
            {participationReviews.map((review) => (
              <Card key={review.id} className="p-5" data-testid={`participation-review-${review.id}`}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="pending">Pending review</Badge>
                      <Badge variant={review.requestedStatus === PARTICIPATION_STATUS_NON_PARTICIPATING ? "locationState" : "approved"}>
                        {review.requestedStatus === PARTICIPATION_STATUS_NON_PARTICIPATING ? "Mark not participating" : "Restore participating"}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{review.deal.title}</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {review.deal.brand?.name ?? "Brand deal"} • {review.restaurant.name}
                      </p>
                    </div>
                    <p className="text-sm text-gray-300">{getRestaurantAddress(review.restaurant)}</p>
                    {review.notes ? <p className="text-sm leading-6 text-gray-300">{review.notes}</p> : null}
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                      Submitted by {getCommunityLabel(review.submittedBy, canSeeCommunityEmails)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <form action={approveParticipationReview.bind(null, review.id)}>
                      <Button type="submit" className="min-w-36">
                        Approve change
                      </Button>
                    </form>
                    <form action={rejectParticipationReview.bind(null, review.id)}>
                      <Button type="submit" variant="danger" className="min-w-32">
                        Reject
                      </Button>
                    </form>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Reports</h2>
        {reports.length === 0 ? (
          <EmptyState
            icon={<CheckCircleIcon size={22} />}
            title="No unresolved reports"
            description="Reported issues will surface here if the community flags a deal for review."
          />
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="border-red-500/10 p-5">
                <p className="text-lg font-semibold text-white">{report.deal.title}</p>
                {report.deal.brand?.name ? (
                  <p className="mt-1 text-sm text-gray-400">{report.deal.brand.name}</p>
                ) : null}
                <p className="mt-2 text-sm leading-6 text-gray-300">Reason: {report.reason}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-500">
                  Reported by {getCommunityLabel(report.user, canSeeCommunityEmails)}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
