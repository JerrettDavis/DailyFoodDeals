import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { approveDeal, rejectDeal, verifyDeal } from "@/actions/admin";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DeploymentStatusNotice } from "@/components/system/DeploymentStatusNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { AlertIcon, CheckCircleIcon, ShieldIcon, SparklesIcon } from "@/components/ui/icons";
import { canUseRuntimeAuth, hasRuntimeDatabase } from "@/lib/runtime-config";
import { formatTime, getDayName } from "@/lib/utils";

export default async function AdminPage() {
  if (!canUseRuntimeAuth || !hasRuntimeDatabase) {
    return (
      <div className="px-4 py-12">
        <DeploymentStatusNotice
          title="Admin tools are temporarily unavailable"
          message="This deployment is missing runtime authentication or database configuration, so moderation tools can't run right now."
          actionHref="/deals"
          actionLabel="Browse available deals"
        />
      </div>
    );
  }

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/");

  const [pendingDeals, approvedDeals, reports] = await Promise.all([
    prisma.deal.findMany({
      where: { status: "PENDING" },
      include: {
        restaurant: true,
        schedules: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
        votes: true,
        favorites: true,
        submittedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.deal.findMany({
      where: { status: "APPROVED", verified: false },
      include: {
        restaurant: true,
        schedules: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
        votes: true,
        favorites: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.report.findMany({
      where: { resolved: false },
      include: {
        deal: { select: { title: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        eyebrow="Moderation workspace"
        title="Admin Dashboard"
        description="Review fresh submissions, verify approved deals, and keep the public feed trustworthy."
      />

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {[
          { title: "Pending", value: pendingDeals.length, icon: <SparklesIcon size={18} />, tone: "text-amber-100 bg-amber-500/10 border-amber-500/20" },
          { title: "Needs Verification", value: approvedDeals.length, icon: <CheckCircleIcon size={18} />, tone: "text-sky-100 bg-sky-500/10 border-sky-500/20" },
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
                      {deal.cuisineType ? <Badge variant="cuisine">{deal.cuisineType}</Badge> : null}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{deal.title}</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {deal.restaurant.name} • {deal.restaurant.city}, {deal.restaurant.state}
                      </p>
                    </div>
                    <p className="max-w-3xl text-sm leading-6 text-gray-300">{deal.description}</p>
                    {deal.priceInfo ? <p className="text-sm font-semibold text-orange-200">{deal.priceInfo}</p> : null}
                    {deal.schedules.length > 0 ? (
                      <p className="text-sm text-gray-500">
                        {deal.schedules.map((schedule) => `${getDayName(schedule.dayOfWeek)} ${formatTime(schedule.startTime)}-${formatTime(schedule.endTime)}`).join(", ")}
                      </p>
                    ) : null}
                    {deal.submittedBy ? (
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                        Submitted by {deal.submittedBy.name ?? deal.submittedBy.email}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-3">
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
                    <h3 className="text-lg font-semibold text-white">{deal.title}</h3>
                    <p className="mt-1 text-sm text-gray-400">{deal.restaurant.name}</p>
                  </div>
                  <form action={verifyDeal.bind(null, deal.id)}>
                    <Button type="submit" size="sm">
                      ✓ Verify
                    </Button>
                  </form>
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
                <p className="mt-2 text-sm leading-6 text-gray-300">Reason: {report.reason}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-500">
                  Reported by {report.user.name ?? report.user.email}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
