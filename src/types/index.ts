import type { Deal, Restaurant, DealSchedule, Vote, Favorite, User } from "@prisma/client";

export type DealWithRelations = Deal & {
  restaurant: Restaurant;
  schedules: DealSchedule[];
  votes: Vote[];
  favorites: Favorite[];
  submittedBy?: User | null;
};

export type DealFilters = {
  day?: number;
  cuisine?: string;
  category?: string;
  kidFriendly?: boolean;
  verified?: boolean;
  search?: string;
  dineIn?: boolean;
  toGo?: boolean;
};

export type VoteType = "UP" | "DOWN" | "CONFIRM" | "EXPIRED";
