"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { useCallback, useTransition } from "react";

export function DealSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      startTransition(() => {
        router.push(`/deals?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  return (
    <div className="relative">
      <Input
        type="search"
        placeholder="Search deals, restaurants..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10"
      />
      <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
      {isPending && (
        <span className="absolute right-3 top-2.5 text-gray-500 text-sm">Loading...</span>
      )}
    </div>
  );
}
