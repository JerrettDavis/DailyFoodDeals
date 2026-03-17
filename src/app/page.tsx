import Link from "next/link";
import { DealGrid } from "@/components/deals/DealGrid";
import { DeploymentStatusNotice } from "@/components/system/DeploymentStatusNotice";
import { buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChevronRightIcon, MapPinIcon, PlusIcon, SparklesIcon } from "@/components/ui/icons";
import { getCurrentDayOfWeek, HOME_QUICK_FILTERS } from "@/lib/utils";
import { getFeaturedDeals } from "@/lib/public-deals";
import { usePublicFallbackData } from "@/lib/runtime-config";

export const dynamic = "force-dynamic";

const heroStats = [
  { label: "Fresh featured deals", value: "Daily" },
  { label: "Community-submitted finds", value: "Verified" },
  { label: "Location-aware browsing", value: "Map ready" },
];

export default async function HomePage() {
  const featuredDeals = await getFeaturedDeals();
  const today = getCurrentDayOfWeek();
  const hasSampleData = featuredDeals.some((deal) => deal.sampleDataActive);

  return (
    <div>
      <section className="px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pb-12 lg:pt-16">
        <div className="mx-auto max-w-7xl">
          <Card className="relative overflow-hidden border-orange-500/10 bg-gradient-to-br from-white/[0.04] via-orange-500/[0.10] to-white/[0.02] px-6 py-8 sm:px-8 lg:px-10 lg:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_24%)]" />
            <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div className="space-y-8">
                <PageHeader
                  eyebrow="Modern local discovery"
                  title="Daily Food Deals"
                  description="Sizzling snacks and daily deals that won&apos;t break the bank. Find what&apos;s worth leaving the house for today, tonight, or this weekend."
                  className="mb-0"
                  actions={
                    <>
                      <Link href={`/deals?day=${today}`} className={buttonVariants({ size: "lg" })}>
                        <SparklesIcon size={18} />
                        Today&apos;s Deals
                      </Link>
                      <Link href="/submit" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                        <PlusIcon size={18} />
                        Submit a Deal
                      </Link>
                    </>
                  }
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  {heroStats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{stat.label}</p>
                      <p className="mt-2 text-lg font-semibold text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-white/10 bg-[#10141d] p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-300">
                    <SparklesIcon size={18} />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-white">Curated by feel, not noise</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    Quickly scan what&apos;s verified, family-friendly, or worth saving for later.
                  </p>
                </Card>
                <Card className="border-white/10 bg-[#10141d] p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-300">
                    <MapPinIcon size={18} />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-white">Built around place</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    Browse by neighborhood context, then open the exact restaurant location the moment you&apos;re ready.
                  </p>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-3">
          {HOME_QUICK_FILTERS.map((filter) => (
            <Link
              key={filter}
              href={`/deals?category=${encodeURIComponent(filter)}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-200 transition hover:border-orange-400/20 hover:bg-orange-500/10 hover:text-white"
            >
              {filter}
              <ChevronRightIcon size={14} />
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="mx-auto max-w-7xl">
          {usePublicFallbackData || hasSampleData ? (
            <DeploymentStatusNotice
              compact
              title={usePublicFallbackData ? "Showing demo deals" : "Some featured deals are sample data"}
              message={
                usePublicFallbackData
                  ? "This deployment is missing a runtime database connection, so public pages are using built-in sample deals instead of live submissions."
                  : "Sample-marked records are labeled in the UI so you can distinguish demos from live submissions."
              }
            />
          ) : null}

          <PageHeader
            eyebrow="Featured this week"
            title="Featured Deals"
            description="A tighter, cleaner feed of standout offers so you can see value at a glance."
            actions={
              <Link href="/deals" className={buttonVariants({ variant: "ghost" })}>
                View All
                <ChevronRightIcon size={16} />
              </Link>
            }
          />

          <DealGrid deals={featuredDeals} emptyMessage="No featured deals yet. Be the first to submit one!" />
        </div>
      </section>
    </div>
  );
}
