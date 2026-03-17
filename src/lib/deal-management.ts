import { redirect } from "next/navigation";
import { auth } from "./auth";
import { prisma } from "./db";
import { canUseRuntimeAuth, hasRuntimeDatabase } from "./runtime-config";

export function isManagerRole(role: string | null | undefined) {
  return role === "ADMIN" || role === "OWNER";
}

export async function requireManagerSession() {
  if (!canUseRuntimeAuth || !hasRuntimeDatabase) {
    redirect("/");
  }

  const session = await auth();
  if (!session?.user?.id || !isManagerRole(session.user.role)) {
    redirect("/");
  }

  return session;
}

export async function canManageDeal(userId: string, role: string | undefined, dealId: string) {
  if (role === "ADMIN") return true;
  if (role !== "OWNER") return false;

  const ownedDeal = await prisma.deal.findFirst({
    where: {
      id: dealId,
      brand: {
        owners: {
          some: {
            userId,
          },
        },
      },
    },
    select: { id: true },
  });

  return Boolean(ownedDeal);
}

export async function getManagerBrandIds(userId: string, role: string | undefined) {
  if (role === "ADMIN") {
    return null;
  }

  if (role !== "OWNER") {
    return [];
  }

  const ownerships = await prisma.brandOwner.findMany({
    where: { userId },
    select: { brandId: true },
  });

  return ownerships.map((ownership) => ownership.brandId);
}
