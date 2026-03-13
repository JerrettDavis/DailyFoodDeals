"use client";
import { toggleFavorite } from "@/actions/favorites";
import { Button } from "@/components/ui/Button";
import { useTransition } from "react";

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
      {isFavorited ? "❤️ Saved" : "🤍 Save"}
    </Button>
  );
}
