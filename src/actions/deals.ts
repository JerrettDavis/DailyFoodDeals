"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { canUseRuntimeAuth, hasRuntimeDatabase } from "@/lib/runtime-config";
import { getSafeExternalHref } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const VALID_DAY_VALUES = new Set([0, 1, 2, 3, 4, 5, 6]);
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PARTICIPATION_STATUSES = new Set(["PARTICIPATING", "NON_PARTICIPATING"]);

function getRequiredText(formData: FormData, field: string) {
  const value = formData.get(field);
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getOptionalText(formData: FormData, field: string) {
  const value = formData.get(field);
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getTimeValue(formData: FormData, field: string, fallback: string) {
  const value = formData.get(field);
  if (value === null) return fallback;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (trimmed.length === 0) return fallback;
  return TIME_PATTERN.test(trimmed) ? trimmed : null;
}

function getOptionalNumber(formData: FormData, field: string, min: number, max: number) {
  const value = formData.get(field);
  if (typeof value !== "string" || value.trim() === "") return undefined;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

function getOptionalHttpUrl(formData: FormData, field: string) {
  const value = getOptionalText(formData, field);
  if (value === undefined) return undefined;

  return getSafeExternalHref(value);
}

function redirectToSubmitError(message: string): never {
  redirect(`/submit?error=${encodeURIComponent(message)}`);
}

function redirectToSubmitSuccess(message: string): never {
  redirect(`/submit?success=${encodeURIComponent(message)}`);
}

function redirectToDealMessage(dealId: string, key: "success" | "error", message: string): never {
  redirect(`/deals/${dealId}?${key}=${encodeURIComponent(message)}`);
}

export async function submitDeal(formData: FormData) {
  if (!canUseRuntimeAuth || !hasRuntimeDatabase) {
    redirectToSubmitError("Deal submissions are temporarily unavailable on this deployment.");
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const restaurantName = getRequiredText(formData, "restaurantName");
  const restaurantAddress = getRequiredText(formData, "restaurantAddress");
  const restaurantCity = getRequiredText(formData, "restaurantCity");
  const restaurantState = getRequiredText(formData, "restaurantState");
  const restaurantZip = getRequiredText(formData, "restaurantZip");
  const title = getRequiredText(formData, "title");
  const description = getRequiredText(formData, "description");
  const startTime = getTimeValue(formData, "startTime", "11:00");
  const endTime = getTimeValue(formData, "endTime", "14:00");
  const restaurantPhone = getOptionalText(formData, "restaurantPhone");
  const restaurantWebsite = getOptionalHttpUrl(formData, "restaurantWebsite");
  const restaurantLatitude = getOptionalNumber(formData, "restaurantLatitude", -90, 90);
  const restaurantLongitude = getOptionalNumber(formData, "restaurantLongitude", -180, 180);
  const sourceUrl = getOptionalHttpUrl(formData, "sourceUrl");

  if (!restaurantName || !restaurantAddress || !restaurantCity || !restaurantState || !restaurantZip || !title || !description) {
    redirectToSubmitError("Please fill out all required fields.");
  }

  if (!startTime || !endTime) {
    redirectToSubmitError("Please provide valid start and end times.");
  }

  if (restaurantWebsite === null) {
    redirectToSubmitError("Please enter a valid website URL starting with http:// or https://.");
  }

  if (sourceUrl === null) {
    redirectToSubmitError("Please enter a valid source URL starting with http:// or https://.");
  }

  if (restaurantLatitude === null || restaurantLongitude === null) {
    redirectToSubmitError("Latitude must be between -90 and 90 and longitude must be between -180 and 180.");
  }

  if ((restaurantLatitude === undefined) !== (restaurantLongitude === undefined)) {
    redirectToSubmitError("Add both latitude and longitude to place a restaurant on the map.");
  }

  const dayValues = formData.getAll("days");
  if (dayValues.length === 0) {
    redirectToSubmitError("Select at least one available day.");
  }

  const parsedDays = dayValues.map((value) => {
    if (typeof value !== "string" || value.trim() === "") return null;
    const day = Number(value);
    return Number.isInteger(day) && VALID_DAY_VALUES.has(day) ? day : null;
  });

  if (parsedDays.some((day) => day === null)) {
    redirectToSubmitError("Select valid days for the deal schedule.");
  }

  const days = [...new Set(parsedDays.filter((day): day is number => day !== null))];

  let restaurant = await prisma.restaurant.findFirst({
    where: {
      name: restaurantName,
      address: restaurantAddress,
      city: restaurantCity,
      state: restaurantState,
      zip: restaurantZip,
    },
  });

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: restaurantName,
        address: restaurantAddress,
        city: restaurantCity,
        state: restaurantState,
        zip: restaurantZip,
        phone: restaurantPhone,
        website: restaurantWebsite,
        latitude: restaurantLatitude,
        longitude: restaurantLongitude,
      },
    });
  }

  await prisma.deal.create({
    data: {
      restaurantId: restaurant.id,
      brandId: restaurant.brandId ?? null,
      title,
      description,
      priceInfo: getOptionalText(formData, "priceInfo"),
      dineIn: formData.get("dineIn") === "on",
      toGo: formData.get("toGo") === "on",
      kidFriendly: formData.get("kidFriendly") === "on",
      alcoholAvailable: formData.get("alcoholAvailable") === "on",
      kidsEatFree: formData.get("kidsEatFree") === "on",
      vegetarianFriendly: formData.get("vegetarianFriendly") === "on",
      familyFriendly: formData.get("familyFriendly") === "on",
      lateNight: formData.get("lateNight") === "on",
      cuisineType: getOptionalText(formData, "cuisineType"),
      category: getOptionalText(formData, "category"),
      sourceUrl,
      notes: getOptionalText(formData, "notes"),
      submittedById: session.user.id,
      status: "PENDING",
      schedules: {
        create: days.map((day) => ({
          dayOfWeek: day,
          startTime,
          endTime,
        })),
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/deals");
  revalidatePath("/");
  redirectToSubmitSuccess("Deal submitted for review.");
}

export async function registerUser(formData: FormData): Promise<{ error: string } | undefined> {
  if (!canUseRuntimeAuth || !hasRuntimeDatabase) {
    return { error: "Account creation is temporarily unavailable on this deployment." };
  }

  const bcrypt = await import("bcryptjs");
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");
  const rawName = formData.get("name");

  if (typeof rawEmail !== "string" || typeof rawPassword !== "string" || typeof rawName !== "string") {
    return { error: "Please complete the signup form." };
  }

  const email = rawEmail.trim().toLowerCase();
  const name = rawName.trim();
  const password = rawPassword;

  if (!email || !name || !password) {
    return { error: "Name, email, and password are required." };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (password.length < 8 || !/\p{L}/u.test(password) || !/\p{N}/u.test(password)) {
    return { error: "Password must be at least 8 characters and include letters and numbers." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already in use" };

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, name, password: hashed },
  });
}

export async function suggestLocationParticipation(formData: FormData) {
  if (!canUseRuntimeAuth || !hasRuntimeDatabase) {
    redirect("/");
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const dealId = getRequiredText(formData, "dealId");
  const restaurantId = getRequiredText(formData, "restaurantId");
  const requestedStatus = getRequiredText(formData, "requestedStatus");
  const notes = getOptionalText(formData, "notes");
  const sourceUrl = getOptionalHttpUrl(formData, "sourceUrl");

  if (!dealId || !restaurantId || !requestedStatus) {
    redirect("/");
  }

  if (!PARTICIPATION_STATUSES.has(requestedStatus)) {
    redirectToDealMessage(dealId, "error", "Invalid participation status.");
  }

  if (sourceUrl === null) {
    redirectToDealMessage(dealId, "error", "Please enter a valid source URL starting with http:// or https://.");
  }

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: {
      id: true,
      brandId: true,
      scope: true,
    },
  });

  if (!deal?.brandId || deal.scope !== "ALL_LOCATIONS") {
    redirectToDealMessage(dealId, "error", "Participation suggestions are only available for all-location deals.");
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      id: restaurantId,
      brandId: deal.brandId,
    },
    select: { id: true },
  });

  if (!restaurant) {
    redirectToDealMessage(dealId, "error", "That location is not part of this deal.");
  }

  const existingPendingReview = await prisma.dealLocationParticipationReview.findFirst({
    where: {
      dealId,
      restaurantId,
      submittedById: session.user.id,
      status: "PENDING",
    },
    select: { id: true },
  });

  if (existingPendingReview) {
    redirectToDealMessage(dealId, "success", "Your participation note is already pending review.");
  }

  await prisma.dealLocationParticipationReview.create({
    data: {
      dealId,
      restaurantId,
      requestedStatus,
      notes,
      sourceUrl,
      submittedById: session.user.id,
      status: "PENDING",
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/deals/${dealId}`);
  redirectToDealMessage(dealId, "success", "Thanks — your location update was submitted for review.");
}
