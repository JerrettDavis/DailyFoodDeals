"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MapPinIcon } from "@/components/ui/icons";

export function UseMyLocationButton() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLocation = useMemo(
    () => Boolean(searchParams.get("lat") && searchParams.get("lng")),
    [searchParams]
  );

  const buttonLabel = pending ? "Finding you..." : hasLocation ? "Refresh location" : "Use my location";

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => {
          if (!navigator.geolocation) {
            setError("Location lookup is not available in this browser.");
            return;
          }

          setPending(true);
          setError(null);

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const nextParams = new URLSearchParams(searchParams.toString());
              nextParams.set("lat", position.coords.latitude.toFixed(6));
              nextParams.set("lng", position.coords.longitude.toFixed(6));
              router.push(`${pathname}?${nextParams.toString()}`);
              setPending(false);
            },
            () => {
              setPending(false);
              setError("We couldn't access your location. Check browser permissions and try again.");
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
            }
          );
        }}
        disabled={pending}
      >
        <MapPinIcon size={16} />
        {buttonLabel}
      </Button>
      {error ? <p className="text-xs text-amber-200">{error}</p> : null}
    </div>
  );
}
