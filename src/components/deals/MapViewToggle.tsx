"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GridIcon, MapIcon } from "@/components/ui/icons";

type MapView = "list" | "map";

export function MapViewToggle({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = (searchParams.get("view") === "map" ? "map" : "list") as MapView;

  const updateView = (view: MapView) => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "list") {
      params.delete("view");
    } else {
      params.set("view", view);
    }

    router.push(params.toString() ? `/deals?${params.toString()}` : "/deals");
  };

  return (
    <div className="inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-1">
      <Button
        type="button"
        variant={currentView === "list" ? "primary" : "ghost"}
        size="sm"
        onClick={() => updateView("list")}
      >
        <GridIcon size={16} />
        List
      </Button>
      <Button
        type="button"
        variant={currentView === "map" ? "primary" : "ghost"}
        size="sm"
        onClick={() => updateView("map")}
        disabled={disabled}
        title={disabled ? "Map view requires deal coordinates" : undefined}
      >
        <MapIcon size={16} />
        Map
      </Button>
    </div>
  );
}
