import { type Restaurant } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function getDayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] ?? "Unknown";
}

export const CUISINE_TYPES = [
  "American",
  "Italian",
  "Mexican",
  "Chinese",
  "Japanese",
  "Thai",
  "Indian",
  "Mediterranean",
  "BBQ",
  "Seafood",
  "Pizza",
  "Burgers",
  "Sandwiches",
  "Salads",
  "Desserts",
  "Other",
];

export const DEAL_CATEGORIES = [
  "Happy Hour",
  "Daily Special",
  "Kids Meal",
  "Family Deal",
  "Late Night",
  "Lunch Special",
  "Dinner Deal",
  "Weekend Special",
];

export const HOME_QUICK_FILTERS = [
  "Happy Hour",
  "Kids Meal",
  "Late Night",
  "Lunch Special",
  "Family Deal",
] as const;

export const DEAL_OPTION_FIELDS = [
  { name: "dineIn", label: "Dine In" },
  { name: "toGo", label: "To Go" },
  { name: "kidFriendly", label: "Kid Friendly" },
  { name: "kidsEatFree", label: "Kids Eat Free" },
  { name: "vegetarianFriendly", label: "Vegetarian Friendly" },
  { name: "familyFriendly", label: "Family Friendly" },
  { name: "lateNight", label: "Late Night" },
  { name: "alcoholAvailable", label: "Alcohol Available" },
] as const;

type RestaurantLocation = Pick<Restaurant, "address" | "city" | "state" | "zip" | "latitude" | "longitude">;

export function getRestaurantAddress(restaurant: Pick<Restaurant, "address" | "city" | "state" | "zip">) {
  return `${restaurant.address}, ${restaurant.city}, ${restaurant.state} ${restaurant.zip}`;
}

export function hasCoordinates(
  restaurant: RestaurantLocation | null | undefined
): restaurant is RestaurantLocation & { latitude: number; longitude: number } {
  return typeof restaurant?.latitude === "number" && typeof restaurant.longitude === "number";
}

export function getRestaurantMapsHref(restaurant: Pick<Restaurant, "address" | "city" | "state" | "zip" | "latitude" | "longitude">) {
  const query = hasCoordinates(restaurant)
    ? `${restaurant.latitude},${restaurant.longitude}`
    : getRestaurantAddress(restaurant);

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function getSafeExternalHref(rawUrl: string | null | undefined) {
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function getCurrentDayOfWeek(timeZone = "America/Chicago") {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
  }).format(new Date());

  const dayIndex = DAY_NAMES.findIndex((day) => day === weekday);
  return dayIndex >= 0 ? dayIndex : new Date().getDay();
}
