import type { Restaurant } from "@prisma/client";
import type { DealLocationState, DealWithRelations, ResolvedDeal } from "@/types";
import { hasCoordinates } from "./utils";

export const DEAL_SCOPE_LOCATION = "LOCATION";
export const DEAL_SCOPE_ALL_LOCATIONS = "ALL_LOCATIONS";
export const PARTICIPATION_STATUS_PARTICIPATING = "PARTICIPATING";
export const PARTICIPATION_STATUS_NON_PARTICIPATING = "NON_PARTICIPATING";

export type UserCoordinates = {
  latitude: number;
  longitude: number;
};

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceMiles(origin: UserCoordinates, restaurant: Restaurant) {
  if (!hasCoordinates(restaurant)) return null;

  const earthRadiusMiles = 3958.8;
  const latitudeDelta = degreesToRadians(restaurant.latitude - origin.latitude);
  const longitudeDelta = degreesToRadians(restaurant.longitude - origin.longitude);
  const originLatitude = degreesToRadians(origin.latitude);
  const destinationLatitude = degreesToRadians(restaurant.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  const distance = 2 * earthRadiusMiles * Math.asin(Math.sqrt(haversine));
  return Number.isFinite(distance) ? distance : null;
}

function sortLocations(left: DealLocationState, right: DealLocationState) {
  if (left.distanceMiles !== null && right.distanceMiles !== null) {
    return left.distanceMiles - right.distanceMiles;
  }
  if (left.distanceMiles !== null) return -1;
  if (right.distanceMiles !== null) return 1;

  return (
    left.restaurant.city.localeCompare(right.restaurant.city) ||
    left.restaurant.name.localeCompare(right.restaurant.name) ||
    left.restaurant.address.localeCompare(right.restaurant.address)
  );
}

function getBaseRestaurants(deal: DealWithRelations) {
  if (deal.scope === DEAL_SCOPE_ALL_LOCATIONS && deal.brand?.restaurants.length) {
    return deal.brand.restaurants;
  }

  return [deal.restaurant];
}

export function resolveDeal(deal: DealWithRelations, userCoordinates?: UserCoordinates | null): ResolvedDeal {
  const participationByRestaurantId = new Map(
    deal.locationParticipations.map((participation) => [participation.restaurantId, participation])
  );
  const baseRestaurants = getBaseRestaurants(deal);
  const participatingLocations: DealLocationState[] = [];
  const nonParticipatingLocations: DealLocationState[] = [];

  for (const restaurant of baseRestaurants) {
    const override = participationByRestaurantId.get(restaurant.id);
    const status = override?.status ?? PARTICIPATION_STATUS_PARTICIPATING;
    const locationState: DealLocationState = {
      ...(override ?? {
        id: `${deal.id}:${restaurant.id}:default`,
        dealId: deal.id,
        restaurantId: restaurant.id,
        status,
        source: "SYSTEM_DEFAULT",
        notes: null,
        updatedById: null,
        createdAt: deal.createdAt,
        updatedAt: deal.updatedAt,
      }),
      restaurant,
      distanceMiles: userCoordinates ? getDistanceMiles(userCoordinates, restaurant) : null,
      isNearest: false,
    };

    if (status === PARTICIPATION_STATUS_NON_PARTICIPATING) {
      nonParticipatingLocations.push(locationState);
    } else {
      participatingLocations.push(locationState);
    }
  }

  participatingLocations.sort(sortLocations);
  nonParticipatingLocations.sort(sortLocations);

  if (participatingLocations[0]) {
    participatingLocations[0].isNearest = true;
  }

  const nearestLocation = participatingLocations[0] ?? null;
  const displayRestaurant = nearestLocation?.restaurant ?? deal.restaurant;
  const sampleDataActive =
    deal.isSampleData ||
    deal.restaurant.isSampleData ||
    Boolean(deal.brand?.restaurants.some((restaurant) => restaurant.isSampleData));

  return {
    ...deal,
    displayRestaurant,
    displayBrand: deal.brand,
    participatingLocations,
    nonParticipatingLocations,
    nearestLocation,
    locationCount: participatingLocations.length,
    isAllLocationsDeal: deal.scope === DEAL_SCOPE_ALL_LOCATIONS,
    sampleDataActive,
  };
}

export function resolveDeals(deals: DealWithRelations[], userCoordinates?: UserCoordinates | null) {
  return deals.map((deal) => resolveDeal(deal, userCoordinates));
}

export function parseUserCoordinates(value: { lat?: string; lng?: string } | null | undefined) {
  if (!value?.lat || !value?.lng) return null;

  const latitude = Number(value.lat);
  const longitude = Number(value.lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}
