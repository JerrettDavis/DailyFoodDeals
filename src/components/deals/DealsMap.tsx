"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { divIcon, latLngBounds, type LatLngExpression } from "leaflet";
import { Card } from "@/components/ui/Card";
import { ExternalLinkIcon, MapPinIcon } from "@/components/ui/icons";

export interface DealsMapPoint {
  id: string;
  title: string;
  restaurantName: string;
  priceInfo?: string | null;
  latitude: number;
  longitude: number;
  href?: string;
  mapsHref?: string;
}

interface DealsMapProps {
  points: DealsMapPoint[];
  className?: string;
  heightClassName?: string;
}

function FitBounds({ points }: { points: DealsMapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView([points[0].latitude, points[0].longitude], 14);
      return;
    }

    const bounds = latLngBounds(points.map((point) => [point.latitude, point.longitude]));
    map.fitBounds(bounds, { padding: [32, 32] });
  }, [map, points]);

  return null;
}

export function DealsMap({ points, className, heightClassName = "h-[420px]" }: DealsMapProps) {
  const markerIcon = useMemo(
    () =>
      divIcon({
        className: "",
        html: `
          <div style="
            align-items:center;
            background:linear-gradient(180deg,#fb923c,#f97316);
            border:2px solid rgba(255,255,255,0.55);
            border-radius:999px;
            box-shadow:0 14px 28px -14px rgba(249,115,22,0.95);
            color:white;
            display:flex;
            font-size:14px;
            font-weight:700;
            height:32px;
            justify-content:center;
            width:32px;
          ">D</div>
        `,
        iconAnchor: [16, 16],
        popupAnchor: [0, -12],
      }),
    []
  );

  if (points.length === 0) {
    return (
      <div data-testid="deals-map">
        <Card className={className}>
          <div className={`${heightClassName} flex flex-col items-center justify-center gap-3 p-8 text-center`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-orange-300">
              <MapPinIcon />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Map preview unavailable</h3>
              <p className="max-w-md text-sm leading-6 text-gray-400">
                This view needs restaurant coordinates. You can still use the address links below to open the location in your maps app.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const center: LatLngExpression = [points[0].latitude, points[0].longitude];

  return (
    <div data-testid="deals-map">
      <Card className={className}>
        <div className={`${heightClassName} overflow-hidden`}>
          <MapContainer center={center} className="h-full w-full" scrollWheelZoom={false} zoom={13} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={points} />
          {points.map((point) => (
            <Marker
              key={point.id}
              icon={markerIcon}
              position={[point.latitude, point.longitude]}
            >
              <Popup>
                <div className="min-w-[180px] space-y-3 py-1">
                  <div>
                    <p className="text-sm font-semibold text-white">{point.title}</p>
                    <p className="text-xs text-gray-300">{point.restaurantName}</p>
                    {point.priceInfo ? <p className="mt-1 text-xs font-medium text-orange-200">{point.priceInfo}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-orange-200">
                    {point.href ? (
                      <Link href={point.href} className="inline-flex items-center gap-1 hover:text-white">
                        View deal
                      </Link>
                    ) : null}
                    {point.mapsHref ? (
                      <a
                        href={point.mapsHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-white"
                      >
                        Open maps
                        <ExternalLinkIcon size={14} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          </MapContainer>
        </div>
      </Card>
    </div>
  );
}
