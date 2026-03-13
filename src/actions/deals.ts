"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitDeal(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const days = formData.getAll("days").map(Number);
  const restaurantName = formData.get("restaurantName") as string;
  const restaurantAddress = formData.get("restaurantAddress") as string;
  const restaurantCity = formData.get("restaurantCity") as string;
  const restaurantState = formData.get("restaurantState") as string;
  const restaurantZip = formData.get("restaurantZip") as string;

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

  const deal = await prisma.deal.create({
    data: {
      restaurantId: restaurant.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      priceInfo: formData.get("priceInfo") as string || undefined,
      dineIn: formData.get("dineIn") === "on",
      toGo: formData.get("toGo") === "on",
      kidFriendly: formData.get("kidFriendly") === "on",
      alcoholAvailable: formData.get("alcoholAvailable") === "on",
      kidsEatFree: formData.get("kidsEatFree") === "on",
      vegetarianFriendly: formData.get("vegetarianFriendly") === "on",
      familyFriendly: formData.get("familyFriendly") === "on",
      lateNight: formData.get("lateNight") === "on",
      cuisineType: formData.get("cuisineType") as string || undefined,
      category: formData.get("category") as string || undefined,
      sourceUrl: formData.get("sourceUrl") as string || undefined,
      notes: formData.get("notes") as string || undefined,
      submittedById: session.user.id,
      status: "PENDING",
      schedules: {
        create: days.map((day) => ({
          dayOfWeek: day,
          startTime: formData.get("startTime") as string || "11:00",
          endTime: formData.get("endTime") as string || "14:00",
        })),
      },
    },
  });

  revalidatePath("/deals");
  redirect(`/deals/${deal.id}`);
}

export async function registerUser(formData: FormData) {
  const bcrypt = await import("bcryptjs");
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already in use");

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, name, password: hashed },
  });
  redirect("/auth/signin?registered=true");
}
