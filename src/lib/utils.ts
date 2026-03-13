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
