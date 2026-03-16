"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { canUseRuntimeAuth, hasRuntimeDatabase } from "@/lib/runtime-config";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type VoteType = "UP" | "DOWN" | "CONFIRM" | "EXPIRED";

export async function voteDeal(dealId: string, voteType: VoteType) {
  if (!canUseRuntimeAuth || !hasRuntimeDatabase) {
    redirect("/deals");
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const existing = await prisma.vote.findUnique({
    where: { dealId_userId: { dealId, userId: session.user.id } },
  });

  if (existing?.voteType === voteType) {
    await prisma.vote.delete({
      where: { dealId_userId: { dealId, userId: session.user.id } },
    });
  } else if (existing) {
    await prisma.vote.update({
      where: { dealId_userId: { dealId, userId: session.user.id } },
      data: { voteType },
    });
  } else {
    await prisma.vote.create({
      data: { dealId, userId: session.user.id, voteType },
    });
  }

  revalidatePath(`/deals/${dealId}`);
}

export async function reportDeal(dealId: string, reason: string) {
  if (!canUseRuntimeAuth || !hasRuntimeDatabase) {
    redirect("/deals");
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  await prisma.report.create({
    data: { dealId, userId: session.user.id, reason },
  });

  revalidatePath(`/deals/${dealId}`);
}
