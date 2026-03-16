"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { canUseRuntimeAuth, hasRuntimeDatabase } from "@/lib/runtime-config";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  if (!canUseRuntimeAuth || !hasRuntimeDatabase) {
    redirect("/");
  }

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session;
}

export async function approveDeal(id: string) {
  await requireAdmin();
  await prisma.deal.update({
    where: { id },
    data: { status: "APPROVED" },
  });
  revalidatePath("/admin");
  revalidatePath("/deals");
}

export async function rejectDeal(id: string) {
  await requireAdmin();
  await prisma.deal.update({
    where: { id },
    data: { status: "REJECTED" },
  });
  revalidatePath("/admin");
}

export async function verifyDeal(id: string) {
  await requireAdmin();
  await prisma.deal.update({
    where: { id },
    data: { verified: true, verifiedAt: new Date() },
  });
  revalidatePath("/admin");
  revalidatePath("/deals");
}
