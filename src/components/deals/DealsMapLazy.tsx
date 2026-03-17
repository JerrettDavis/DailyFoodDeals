"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";
import type { DealsMapPoint } from "./DealsMap";

interface DealsMapLazyProps {
  points: DealsMapPoint[];
  className?: string;
  heightClassName?: string;
}

const DynamicDealsMap = dynamic(
  () => import("./DealsMap").then((mod) => mod.DealsMap),
  {
    ssr: false,
    loading: () => (
      <Card className="h-[440px] p-6">
        <div className="flex h-full items-center justify-center text-sm text-gray-400">Loading map...</div>
      </Card>
    ),
  }
);

export function DealsMapLazy(props: DealsMapLazyProps) {
  return <DynamicDealsMap {...props} />;
}
