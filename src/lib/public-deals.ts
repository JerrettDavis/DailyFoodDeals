import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { DealWithRelations } from "@/types";
import { fallbackDeals } from "./fallback-deals";
import { usePublicFallbackData } from "./runtime-config";

export type DealSearchFilters = {
  day?: string;
  cuisine?: string;
  category?: string;
  kidFriendly?: string;
  verified?: string;
  search?: string;
  dineIn?: string;
  toGo?: string;
};

function sortDeals(deals: DealWithRelations[]) {
  return [...deals].sort((a, b) => {
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

function filterFallbackDeals(filters: DealSearchFilters): DealWithRelations[] {
  const search = filters.search?.trim().toLowerCase();
  const parsedDay =
    filters.day !== undefined && filters.day.trim() !== "" ? Number(filters.day) : undefined;

  return sortDeals(fallbackDeals).filter((deal) => {
    if (filters.verified === "true" && !deal.verified) return false;
    if (filters.kidFriendly === "true" && !deal.kidFriendly) return false;
    if (filters.dineIn === "true" && !deal.dineIn) return false;
    if (filters.toGo === "true" && !deal.toGo) return false;
    if (filters.cuisine && deal.cuisineType !== filters.cuisine) return false;
    if (filters.category && deal.category !== filters.category) return false;
    if (
      parsedDay !== undefined &&
      Number.isInteger(parsedDay) &&
      parsedDay >= 0 &&
      parsedDay <= 6 &&
      !deal.schedules.some((schedule) => schedule.dayOfWeek === parsedDay)
    ) {
      return false;
    }

    if (search) {
      const haystacks = [
        deal.title,
        deal.description,
        deal.restaurant.name,
        deal.restaurant.address,
        deal.restaurant.city,
        deal.restaurant.state,
      ].map((value) => value.toLowerCase());
      if (!haystacks.some((value) => value.includes(search))) return false;
    }

    return true;
  });
}

export async function getFeaturedDeals(): Promise<DealWithRelations[]> {
  if (usePublicFallbackData) {
    return sortDeals(fallbackDeals).slice(0, 6);
  }

  const deals = await prisma.deal.findMany({
    where: { status: "APPROVED" },
    include: {
      restaurant: true,
      schedules: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
      votes: true,
      favorites: true,
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return deals as DealWithRelations[];
}

export async function getPublicDeals(filters: DealSearchFilters): Promise<DealWithRelations[]> {
  if (usePublicFallbackData) {
    return filterFallbackDeals(filters);
  }

  const where: Prisma.DealWhereInput = { status: "APPROVED" };
  const dayValue = filters.day?.trim();
  const parsedDay = dayValue !== undefined && dayValue !== "" ? Number(dayValue) : undefined;

  if (filters.verified === "true") where.verified = true;
  if (filters.kidFriendly === "true") where.kidFriendly = true;
  if (filters.dineIn === "true") where.dineIn = true;
  if (filters.toGo === "true") where.toGo = true;
  if (filters.cuisine) where.cuisineType = filters.cuisine;
  if (filters.category) where.category = filters.category;

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { description: { contains: filters.search } },
      { restaurant: { is: { name: { contains: filters.search } } } },
      { restaurant: { is: { address: { contains: filters.search } } } },
      { restaurant: { is: { city: { contains: filters.search } } } },
      { restaurant: { is: { state: { contains: filters.search } } } },
    ];
  }

  if (parsedDay !== undefined && Number.isInteger(parsedDay) && parsedDay >= 0 && parsedDay <= 6) {
    where.schedules = { some: { dayOfWeek: parsedDay } };
  }

  const deals = await prisma.deal.findMany({
    where,
    include: {
      restaurant: true,
      schedules: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
      votes: true,
      favorites: true,
    },
    orderBy: [{ verified: "desc" }, { createdAt: "desc" }],
  });

  return deals as DealWithRelations[];
}

export async function getPublicDealById(id: string): Promise<DealWithRelations | null> {
  if (usePublicFallbackData) {
    return fallbackDeals.find((deal) => deal.id === id) ?? null;
  }

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      restaurant: true,
      schedules: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
      votes: true,
      favorites: true,
    },
  });

  return deal as DealWithRelations | null;
}
