"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { SearchIcon } from "@/components/ui/icons";

function DealSearchField({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(initialValue);

  const handleSearch = useCallback(
    (nextValue: string) => {
      setValue(nextValue);
      const params = new URLSearchParams(searchParams.toString());
      if (nextValue) {
        params.set("search", nextValue);
      } else {
        params.delete("search");
      }
      startTransition(() => {
        router.replace(params.toString() ? `/deals?${params.toString()}` : "/deals");
      });
    },
    [router, searchParams]
  );

  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
      <Input
        type="search"
        placeholder="Search deals, restaurants..."
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        className="h-12 pl-12 pr-24"
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.18em] text-gray-500">
        {isPending ? "Loading" : "Live search"}
      </span>
    </div>
  );
}

export function DealSearch() {
  const searchParams = useSearchParams();
  const initialValue = searchParams.get("search") ?? "";

  return <DealSearchField key={initialValue} initialValue={initialValue} />;
}
