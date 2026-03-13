"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { DAY_NAMES, CUISINE_TYPES, DEAL_CATEGORIES } from "@/lib/utils";

export function DealFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/deals?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/deals");
  };

  const hasFilters = searchParams.toString() !== "";

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white text-lg">Filters</h2>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-orange-500">
            Clear All
          </Button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Day of Week</label>
        <Select
          value={searchParams.get("day") ?? ""}
          onChange={(e) => updateFilter("day", e.target.value)}
        >
          <option value="">All Days</option>
          {DAY_NAMES.map((day, i) => (
            <option key={day} value={String(i)}>{day}</option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Cuisine Type</label>
        <Select
          value={searchParams.get("cuisine") ?? ""}
          onChange={(e) => updateFilter("cuisine", e.target.value)}
        >
          <option value="">All Cuisines</option>
          {CUISINE_TYPES.map((cuisine) => (
            <option key={cuisine} value={cuisine}>{cuisine}</option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
        <Select
          value={searchParams.get("category") ?? ""}
          onChange={(e) => updateFilter("category", e.target.value)}
        >
          <option value="">All Categories</option>
          {DEAL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-400">Options</label>
        {[
          { key: "verified", label: "✓ Verified Only" },
          { key: "kidFriendly", label: "👶 Kid Friendly" },
          { key: "dineIn", label: "🍽️ Dine In" },
          { key: "toGo", label: "🥡 To Go" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={searchParams.get(key) === "true"}
              onChange={(e) => updateFilter(key, e.target.checked ? "true" : "")}
              className="rounded border-gray-700 bg-gray-800 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-gray-300 text-sm">{label}</span>
          </label>
        ))}
      </div>
    </aside>
  );
}
