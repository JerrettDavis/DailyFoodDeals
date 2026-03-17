import Link from "next/link";
import { LogoMark, MapPinIcon, SparklesIcon } from "@/components/ui/icons";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0d12]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.3fr_0.8fr_0.8fr] lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-300">
              <LogoMark size={22} />
            </div>
            <div>
              <p className="text-base font-semibold text-white">DailyFoodDeals</p>
              <p className="text-sm text-gray-500">Modern food deal discovery for local regulars.</p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-gray-400">
            Discover daily specials, happy hours, family offers, and neighborhood favorites without digging through a dozen menus.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Explore</p>
          <div className="mt-4 grid gap-3 text-sm text-gray-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/deals" className="hover:text-white">Browse Deals</Link>
            <Link href="/submit" className="hover:text-white">Submit a Deal</Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Built for</p>
          <div className="mt-4 space-y-3 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <SparklesIcon size={16} className="text-orange-300" />
              Curated neighborhood finds
            </div>
            <div className="flex items-center gap-2">
              <MapPinIcon size={16} className="text-orange-300" />
              Location-aware discovery
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-gray-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>&copy; {new Date().getFullYear()} DailyFoodDeals.</p>
          <p>Built to make everyday dining feel easier, faster, and more local.</p>
        </div>
      </div>
    </footer>
  );
}
