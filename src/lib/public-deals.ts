import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { dealWithRelationsInclude, type DealWithRelations, type ResolvedDeal } from "@/types";
import { fallbackDeals } from "./fallback-deals";
import { parseUserCoordinates, resolveDeal, resolveDeals } from "./deal-resolver";
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
  lat?: string;
  lng?: string;
};

function sortDeals(deals: ResolvedDeal[]) {
  return [...deals].sort((a, b) => {
    if (a.verified !== b.verified) return a.verified ? -1 : 1;

    const leftDistance = a.nearestLocation?.distanceMiles ?? null;
    const rightDistance = b.nearestLocation?.distanceMiles ?? null;

    if (leftDistance !== null && rightDistance !== null) {
      return leftDistance - rightDistance;
    }
    if (leftDistance !== null) return -1;
    if (rightDistance !== null) return 1;

    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

function filterFallbackDeals(filters: DealSearchFilters): DealWithRelations[] {
  const search = filters.search?.trim().toLowerCase();
  const parsedDay =
    filters.day !== undefined && filters.day.trim() !== "" ? Number(filters.day) : undefined;

  return fallbackDeals.filter((deal) => {
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
        deal.brand?.name,
        deal.restaurant.address,
        deal.restaurant.city,
        deal.restaurant.state,
        ...deal.locationParticipations.map((location) => location.restaurant.name),
        ...deal.locationParticipations.map((location) => location.restaurant.address),
        ...deal.locationParticipations.map((location) => location.restaurant.city),
        ...deal.locationParticipations.map((location) => location.restaurant.state),
      ]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.toLowerCase());

      if (!haystacks.some((value) => value.includes(search))) return false;
    }

    return true;
  });
}

export async function getFeaturedDeals(): Promise<ResolvedDeal[]> {
  if (usePublicFallbackData) {
    return sortDeals(resolveDeals(fallbackDeals)).slice(0, 6);
  }

  const deals = await prisma.deal.findMany({
    where: { status: "APPROVED" },
    include: dealWithRelationsInclude,
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return sortDeals(resolveDeals(deals as DealWithRelations[])).slice(0, 6);
}

export async function getPublicDeals(filters: DealSearchFilters): Promise<ResolvedDeal[]> {
  const userCoordinates = parseUserCoordinates(filters);

  if (usePublicFallbackData) {
    return sortDeals(resolveDeals(filterFallbackDeals(filters), userCoordinates));
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
      { brand: { is: { name: { contains: filters.search } } } },
      { brand: { is: { restaurants: { some: { name: { contains: filters.search } } } } } },
      { brand: { is: { restaurants: { some: { address: { contains: filters.search } } } } } },
      { brand: { is: { restaurants: { some: { city: { contains: filters.search } } } } } },
      { brand: { is: { restaurants: { some: { state: { contains: filters.search } } } } } },
    ];
  }

  if (parsedDay !== undefined && Number.isInteger(parsedDay) && parsedDay >= 0 && parsedDay <= 6) {
    where.schedules = { some: { dayOfWeek: parsedDay } };
  }

  const deals = await prisma.deal.findMany({
    where,
    include: dealWithRelationsInclude,
    orderBy: [{ verified: "desc" }, { createdAt: "desc" }],
  });

  return sortDeals(resolveDeals(deals as DealWithRelations[], userCoordinates));
}

export async function getPublicDealById(
  id: string,
  options?: {
    lat?: string;
    lng?: string;
  }
): Promise<ResolvedDeal | null> {
  const userCoordinates = parseUserCoordinates(options);

  if (usePublicFallbackData) {
    const fallbackDeal = fallbackDeals.find((deal) => deal.id === id) ?? null;
    return fallbackDeal ? resolveDeal(fallbackDeal, userCoordinates) : null;
  }

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: dealWithRelationsInclude,
  });

  return deal ? resolveDeal(deal as DealWithRelations, userCoordinates) : null;
}
