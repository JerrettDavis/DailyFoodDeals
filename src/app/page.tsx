import Link from "next/link";
import { prisma } from "@/lib/db";
import { DealGrid } from "@/components/deals/DealGrid";
import type { DealWithRelations } from "@/types";

async function getFeaturedDeals(): Promise<DealWithRelations[]> {
  const deals = await prisma.deal.findMany({
    where: { status: "APPROVED" },
    include: {
      restaurant: true,
      schedules: true,
      votes: true,
      favorites: true,
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  return deals as DealWithRelations[];
}

export default async function HomePage() {
  const featuredDeals = await getFeaturedDeals();
  const today = new Date().getDay();

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-orange-950 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🍔🌮🍕</div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Daily Food <span className="text-orange-500">Deals</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Sizzling snacks and daily deals that won&apos;t break the bank
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/deals?day=${today}`}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              🔥 Today&apos;s Deals
            </Link>
            <Link
              href="/submit"
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors border border-gray-700"
            >
              + Submit a Deal
            </Link>
          </div>
        </div>
      </section>

      {/* Quick filters */}
      <section className="bg-gray-900 border-b border-gray-800 py-4 px-4">
        <div className="max-w-7xl mx-auto flex gap-3 overflow-x-auto pb-1">
          {["Happy Hour", "Kids Eat Free", "Late Night", "Lunch Special", "Family Deal"].map((filter) => (
            <Link
              key={filter}
              href={`/deals?category=${encodeURIComponent(filter)}`}
              className="flex-shrink-0 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-orange-500 px-4 py-2 rounded-full text-sm transition-colors border border-gray-700"
            >
              {filter}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured deals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Featured Deals</h2>
          <Link href="/deals" className="text-orange-500 hover:text-orange-400 transition-colors">
            View All →
          </Link>
        </div>
        <DealGrid deals={featuredDeals} emptyMessage="No featured deals yet. Be the first to submit one!" />
      </section>
    </div>
  );
}
