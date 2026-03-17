"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { FilterIcon } from "@/components/ui/icons";
import { CUISINE_TYPES, DAY_NAMES, DEAL_CATEGORIES } from "@/lib/utils";

const optionFilters = [
  { key: "verified", label: "Verified only" },
  { key: "kidFriendly", label: "Kid friendly" },
  { key: "dineIn", label: "Dine in" },
  { key: "toGo", label: "To go" },
] as const;

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
    router.push(params.toString() ? `/deals?${params.toString()}` : "/deals");
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["day", "cuisine", "category", "verified", "kidFriendly", "dineIn", "toGo", "search"].forEach((key) =>
      params.delete(key)
    );
    router.push(params.toString() ? `/deals?${params.toString()}` : "/deals");
  };

  const activePills = optionFilters.filter(({ key }) => searchParams.get(key) === "true");
  const hasFilters =
    activePills.length > 0 ||
    Boolean(searchParams.get("day")) ||
    Boolean(searchParams.get("cuisine")) ||
    Boolean(searchParams.get("category"));

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] text-orange-300">
            <FilterIcon size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Filters</h2>
            <p className="text-sm text-gray-500">Narrow the feed fast.</p>
          </div>
        </div>
        {hasFilters ? (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-orange-300">
            Clear all
          </Button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">Day of week</label>
          <Select value={searchParams.get("day") ?? ""} onChange={(e) => updateFilter("day", e.target.value)}>
            <option value="">All Days</option>
            {DAY_NAMES.map((day, i) => (
              <option key={day} value={String(i)}>
                {day}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">Cuisine</label>
          <Select value={searchParams.get("cuisine") ?? ""} onChange={(e) => updateFilter("cuisine", e.target.value)}>
            <option value="">All Cuisines</option>
            {CUISINE_TYPES.map((cuisine) => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-200">Category</label>
          <Select value={searchParams.get("category") ?? ""} onChange={(e) => updateFilter("category", e.target.value)}>
            <option value="">All Categories</option>
            {DEAL_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <p className="text-sm font-medium text-gray-200">Quick refinements</p>
        <div className="flex flex-wrap gap-2">
          {optionFilters.map(({ key, label }) => {
            const active = searchParams.get(key) === "true";
            return (
              <button
                key={key}
                type="button"
                onClick={() => updateFilter(key, active ? "" : "true")}
                className={`rounded-full border px-3 py-2 text-sm transition ${
                  active
                    ? "border-orange-400/30 bg-orange-500/12 text-orange-100"
                    : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/20 hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {activePills.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {activePills.map(({ key, label }) => (
            <Badge key={key} variant="cuisine">
              {label}
            </Badge>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
