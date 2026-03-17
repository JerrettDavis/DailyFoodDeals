import {
  Prisma,
  type Brand,
  type DealLocationParticipation,
  type DealLocationParticipationReview,
  type Favorite,
  type Restaurant,
  type Vote,
} from "@prisma/client";

export const dealWithRelationsInclude = Prisma.validator<Prisma.DealInclude>()({
  restaurant: true,
  brand: {
    include: {
      restaurants: true,
    },
  },
  schedules: {
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  },
  votes: true,
  favorites: true,
  submittedBy: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  },
  locationParticipations: {
    include: {
      restaurant: true,
      updatedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  },
  participationReviews: {
    include: {
      restaurant: true,
      submittedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      reviewedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  },
});

export type DealWithRelations = Prisma.DealGetPayload<{
  include: typeof dealWithRelationsInclude;
}>;

export type DealLocationState = DealLocationParticipation & {
  restaurant: Restaurant;
  distanceMiles: number | null;
  isNearest: boolean;
};

export type DealLocationReviewWithRelations = DealLocationParticipationReview & {
  restaurant: Restaurant;
  submittedBy: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  } | null;
  reviewedBy: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  } | null;
};

export type ResolvedDeal = DealWithRelations & {
  displayRestaurant: Restaurant;
  displayBrand: Brand | null;
  participatingLocations: DealLocationState[];
  nonParticipatingLocations: DealLocationState[];
  nearestLocation: DealLocationState | null;
  locationCount: number;
  isAllLocationsDeal: boolean;
  sampleDataActive: boolean;
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

export type VoteSummary = Vote[];
export type FavoriteSummary = Favorite[];
export type VoteType = "UP" | "DOWN" | "CONFIRM" | "EXPIRED";
