import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { approveDeal, rejectDeal, verifyDeal } from "@/actions/admin";
import { Badge } from "@/components/ui/Badge";
import { getDayName, formatTime } from "@/lib/utils";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/");

  const [pendingDeals, approvedDeals, reports] = await Promise.all([
    prisma.deal.findMany({
      where: { status: "PENDING" },
      include: {
        restaurant: true,
        schedules: true,
        votes: true,
        favorites: true,
        submittedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.deal.findMany({
      where: { status: "APPROVED", verified: false },
      include: { restaurant: true, schedules: true, votes: true, favorites: true },
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
      <div className="flex gap-4 mb-8">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{pendingDeals.length}</div>
          <div className="text-yellow-400/70 text-sm">Pending</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{approvedDeals.length}</div>
          <div className="text-blue-400/70 text-sm">Unverified</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-center">
          <div className="text-2xl font-bold text-red-400">{reports.length}</div>
          <div className="text-red-400/70 text-sm">Reports</div>
        </div>
      </div>

      {/* Pending deals */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">⏳ Pending Deals</h2>
        {pendingDeals.length === 0 ? (
          <p className="text-gray-400">No pending deals. 🎉</p>
        ) : (
          <div className="space-y-4">
            {pendingDeals.map((deal) => (
              <div key={deal.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="pending">PENDING</Badge>
                      {deal.cuisineType && <Badge variant="cuisine">{deal.cuisineType}</Badge>}
                    </div>
                    <h3 className="font-semibold text-white text-lg">{deal.title}</h3>
                    <p className="text-gray-400 text-sm">{deal.restaurant.name} · {deal.restaurant.city}, {deal.restaurant.state}</p>
                    <p className="text-gray-300 text-sm mt-2">{deal.description}</p>
                    {deal.priceInfo && <p className="text-orange-400 font-medium mt-1">{deal.priceInfo}</p>}
                    {deal.schedules.length > 0 && (
                      <p className="text-gray-500 text-sm mt-1">
                        {deal.schedules.map(s => `${getDayName(s.dayOfWeek)} ${formatTime(s.startTime)}-${formatTime(s.endTime)}`).join(", ")}
                      </p>
                    )}
                    {deal.submittedBy && (
                      <p className="text-gray-500 text-xs mt-2">Submitted by: {deal.submittedBy.name ?? deal.submittedBy.email}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <form action={approveDeal.bind(null, deal.id)}>
                      <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        ✓ Approve
                      </button>
                    </form>
                    <form action={rejectDeal.bind(null, deal.id)}>
                      <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        ✗ Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved but unverified */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">🔍 Approved - Needs Verification</h2>
        {approvedDeals.length === 0 ? (
          <p className="text-gray-400">All approved deals are verified!</p>
        ) : (
          <div className="space-y-3">
            {approvedDeals.map((deal) => (
              <div key={deal.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-white">{deal.title}</h3>
                  <p className="text-gray-400 text-sm">{deal.restaurant.name}</p>
                </div>
                <form action={verifyDeal.bind(null, deal.id)}>
                  <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    ✓ Verify
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reports */}
      {reports.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">🚩 Reports</h2>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="bg-gray-900 border border-red-900/30 rounded-xl p-4">
                <p className="text-white font-medium">{report.deal.title}</p>
                <p className="text-gray-400 text-sm mt-1">Reason: {report.reason}</p>
                <p className="text-gray-500 text-xs mt-1">Reported by: {report.user.name ?? report.user.email}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
