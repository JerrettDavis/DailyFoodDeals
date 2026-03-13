"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const VALID_DAY_VALUES = new Set([0, 1, 2, 3, 4, 5, 6]);
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function redirectToSubmitError(message: string): never {
  redirect(`/submit?error=${encodeURIComponent(message)}`);
}

function redirectToSubmitSuccess(message: string): never {
  redirect(`/submit?success=${encodeURIComponent(message)}`);
}

export async function submitDeal(formData: FormData) {
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

  if (!restaurantName || !restaurantAddress || !restaurantCity || !restaurantState || !restaurantZip || !title || !description) {
    redirectToSubmitError("Please fill out all required fields.");
  }

  if (!startTime || !endTime) {
    redirectToSubmitError("Please provide valid start and end times.");
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
    where: { name: restaurantName, city: restaurantCity },
  });

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: restaurantName,
        address: restaurantAddress,
        city: restaurantCity,
        state: restaurantState,
        zip: restaurantZip,
      },
    });
  }

  await prisma.deal.create({
    data: {
      restaurantId: restaurant.id,
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
      sourceUrl: getOptionalText(formData, "sourceUrl"),
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
  redirectToSubmitSuccess("Deal submitted for review.");
}

export async function registerUser(formData: FormData): Promise<{ error: string } | undefined> {
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
