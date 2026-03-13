"use client";
import { voteDeal } from "@/actions/votes";
import { Button } from "@/components/ui/Button";

type VoteType = "UP" | "DOWN" | "CONFIRM" | "EXPIRED";
import { useTransition } from "react";

interface VoteButtonsProps {
  dealId: string;
  upvotes: number;
  downvotes: number;
  userVote?: VoteType;
}

export function VoteButtons({ dealId, upvotes, downvotes, userVote }: VoteButtonsProps) {
  const [isPending, startTransition] = useTransition();

  const handleVote = (type: VoteType) => {
    startTransition(() => {
      voteDeal(dealId, type);
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={userVote === "UP" ? "primary" : "secondary"}
        size="sm"
        onClick={() => handleVote("UP")}
        disabled={isPending}
      >
        👍 {upvotes}
      </Button>
      <Button
        variant={userVote === "CONFIRM" ? "primary" : "secondary"}
        size="sm"
        onClick={() => handleVote("CONFIRM")}
        disabled={isPending}
      >
        ✅ Confirm
      </Button>
      <Button
        variant={userVote === "DOWN" ? "danger" : "secondary"}
        size="sm"
        onClick={() => handleVote("DOWN")}
        disabled={isPending}
      >
        👎 {downvotes}
      </Button>
      <Button
        variant={userVote === "EXPIRED" ? "danger" : "ghost"}
        size="sm"
        onClick={() => handleVote("EXPIRED")}
        disabled={isPending}
      >
        ⏰ Expired
      </Button>
    </div>
  );
}
