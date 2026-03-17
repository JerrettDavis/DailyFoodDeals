"use client";

import { useTransition } from "react";
import { toggleFavorite } from "@/actions/favorites";
import { Button } from "@/components/ui/Button";
import { HeartIcon } from "@/components/ui/icons";

interface FavoriteButtonProps {
  dealId: string;
  isFavorited: boolean;
}

export function FavoriteButton({ dealId, isFavorited }: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(() => {
      toggleFavorite(dealId);
    });
  };

  return (
    <Button
      variant={isFavorited ? "primary" : "secondary"}
      onClick={handleToggle}
      disabled={isPending}
      className="flex-shrink-0"
    >
      <HeartIcon size={16} className={isFavorited ? "fill-current" : ""} />
      {isFavorited ? "❤️ Saved" : "🤍 Save"}
    </Button>
  );
}
