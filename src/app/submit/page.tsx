import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { submitDeal } from "@/actions/deals";
import { CUISINE_TYPES, DEAL_CATEGORIES, DAY_NAMES } from "@/lib/utils";

interface SubmitDealPageProps {
  searchParams?: Promise<{
    error?: string;
  }>;
}

export default async function SubmitDealPage({ searchParams }: SubmitDealPageProps) {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Submit a Deal</h1>
      <p className="text-gray-400 mb-8">Share a great food deal with the community. Deals are reviewed before being published.</p>
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form action={submitDeal} className="space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Restaurant Info</h2>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Restaurant Name *</label>
            <input name="restaurantName" required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g., Joe's Burger Shack" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Address *</label>
            <input name="restaurantAddress" required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="123 Main St" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">City *</label>
              <input name="restaurantCity" required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">State *</label>
              <input name="restaurantState" required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="TX" maxLength={2} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Zip Code *</label>
            <input name="restaurantZip" required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="12345" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Deal Info</h2>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Deal Title *</label>
            <input name="title" required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g., Happy Hour 50% Off Appetizers" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description *</label>
            <textarea name="description" required rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Describe the deal in detail..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Price Info</label>
            <input name="priceInfo" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g., $5 off, 50% off, $9.99 special" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Cuisine Type</label>
              <select name="cuisineType" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Select cuisine...</option>
                {CUISINE_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
              <select name="category" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Select category...</option>
                {DEAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Schedule</h2>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Available Days *</label>
            <div className="grid grid-cols-2 gap-2">
              {DAY_NAMES.map((day, i) => (
                <label key={day} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="days" value={String(i)} className="rounded border-gray-700 bg-gray-800 text-orange-500" />
                  <span className="text-gray-300 text-sm">{day}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Start Time</label>
              <input type="time" name="startTime" defaultValue="11:00" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">End Time</label>
              <input type="time" name="endTime" defaultValue="14:00" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Options</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "dineIn", label: "🍽️ Dine In" },
              { name: "toGo", label: "🥡 To Go" },
              { name: "kidFriendly", label: "👶 Kid Friendly" },
              { name: "kidsEatFree", label: "🆓 Kids Eat Free" },
              { name: "vegetarianFriendly", label: "🥗 Vegetarian Friendly" },
              { name: "familyFriendly", label: "👨‍👩‍👧 Family Friendly" },
              { name: "lateNight", label: "🌙 Late Night" },
              { name: "alcoholAvailable", label: "🍺 Alcohol Available" },
            ].map(({ name, label }) => (
              <label key={name} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name={name} className="rounded border-gray-700 bg-gray-800 text-orange-500" />
                <span className="text-gray-300 text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Additional Info</h2>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Source URL</label>
            <input name="sourceUrl" type="url" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <textarea name="notes" rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Any additional notes..." />
          </div>
        </div>

        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors text-lg">
          Submit Deal for Review
        </button>
      </form>
    </div>
  );
}
