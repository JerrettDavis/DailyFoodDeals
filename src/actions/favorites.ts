"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function toggleFavorite(dealId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const existing = await prisma.favorite.findUnique({
    where: { dealId_userId: { dealId, userId: session.user.id } },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { dealId_userId: { dealId, userId: session.user.id } },
    });
  } else {
    await prisma.favorite.create({
      data: { dealId, userId: session.user.id },
    });
  }

  revalidatePath("/favorites");
  revalidatePath(`/deals/${dealId}`);
}
