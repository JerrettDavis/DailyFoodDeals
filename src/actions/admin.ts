"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  DEAL_SCOPE_ALL_LOCATIONS,
  PARTICIPATION_STATUS_NON_PARTICIPATING,
  PARTICIPATION_STATUS_PARTICIPATING,
} from "@/lib/deal-resolver";
import { canManageDeal, requireManagerSession } from "@/lib/deal-management";

const PARTICIPATION_STATUSES = new Set([
  PARTICIPATION_STATUS_PARTICIPATING,
  PARTICIPATION_STATUS_NON_PARTICIPATING,
]);

type ParticipationReviewTransaction = {
  dealLocationParticipationReview: typeof prisma.dealLocationParticipationReview;
  dealLocationParticipation: typeof prisma.dealLocationParticipation;
};

async function requireAdmin() {
  const session = await requireManagerSession();
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return session;
}

async function requireDealManager(dealId: string) {
  const session = await requireManagerSession();
  const allowed = await canManageDeal(session.user.id, session.user.role, dealId);

  if (!allowed) {
    redirect("/");
  }

  return session;
}

function revalidateDealExperience(dealId?: string) {
  revalidatePath("/admin");
  revalidatePath("/deals");
  revalidatePath("/");

  if (dealId) {
    revalidatePath(`/deals/${dealId}`);
  }
}

async function ensureCanRemoveParticipatingLocation(
  dealId: string,
  brandId: string,
  restaurantId: string
) {
  const [brandRestaurants, overrides] = await Promise.all([
    prisma.restaurant.findMany({
      where: { brandId },
      select: { id: true },
    }),
    prisma.dealLocationParticipation.findMany({
      where: { dealId },
      select: { restaurantId: true, status: true },
    }),
  ]);

  const overrideByRestaurantId = new Map(
    overrides.map((override: { restaurantId: string; status: string }) => [
      override.restaurantId,
      override.status,
    ])
  );
  const targetStatus =
    overrideByRestaurantId.get(restaurantId) ?? PARTICIPATION_STATUS_PARTICIPATING;

  if (targetStatus === PARTICIPATION_STATUS_NON_PARTICIPATING) {
    return;
  }

  const activeLocationCount = brandRestaurants.filter((restaurant: { id: string }) => {
    return (
      (overrideByRestaurantId.get(restaurant.id) ?? PARTICIPATION_STATUS_PARTICIPATING) !==
      PARTICIPATION_STATUS_NON_PARTICIPATING
    );
  }).length;

  if (activeLocationCount <= 1) {
    throw new Error("An all-location deal must keep at least one participating location.");
  }
}

export async function approveDeal(id: string) {
  await requireAdmin();
  await prisma.deal.update({
    where: { id },
    data: { status: "APPROVED" },
  });
  revalidateDealExperience(id);
}

export async function rejectDeal(id: string) {
  await requireAdmin();
  await prisma.deal.update({
    where: { id },
    data: { status: "REJECTED" },
  });
  revalidateDealExperience(id);
}

export async function verifyDeal(id: string) {
  await requireAdmin();
  await prisma.deal.update({
    where: { id },
    data: { verified: true, verifiedAt: new Date() },
  });
  revalidateDealExperience(id);
}

export async function setDealSampleState(dealId: string, isSampleData: boolean) {
  await requireAdmin();
  await prisma.deal.update({
    where: { id: dealId },
    data: { isSampleData },
  });
  revalidateDealExperience(dealId);
}

export async function markLocationParticipating(dealId: string, restaurantId: string) {
  const session = await requireDealManager(dealId);
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: { id: true, brandId: true, scope: true },
  });

  if (!deal?.brandId || deal.scope !== DEAL_SCOPE_ALL_LOCATIONS) {
    redirect("/admin");
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      id: restaurantId,
      brandId: deal.brandId,
    },
    select: { id: true },
  });

  if (!restaurant) {
    redirect("/admin");
  }

  await ensureCanRemoveParticipatingLocation(dealId, deal.brandId, restaurantId);

  await prisma.dealLocationParticipation.upsert({
    where: {
      dealId_restaurantId: {
        dealId,
        restaurantId,
      },
    },
    update: {
      status: PARTICIPATION_STATUS_PARTICIPATING,
      source: session.user.role === "ADMIN" ? "ADMIN_DIRECT" : "OWNER_DIRECT",
      updatedById: session.user.id,
      notes: null,
    },
    create: {
      dealId,
      restaurantId,
      status: PARTICIPATION_STATUS_PARTICIPATING,
      source: session.user.role === "ADMIN" ? "ADMIN_DIRECT" : "OWNER_DIRECT",
      updatedById: session.user.id,
    },
  });

  revalidateDealExperience(dealId);
}

export async function markLocationNonParticipating(dealId: string, restaurantId: string) {
  const session = await requireDealManager(dealId);
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: { id: true, brandId: true, scope: true },
  });

  if (!deal?.brandId || deal.scope !== DEAL_SCOPE_ALL_LOCATIONS) {
    redirect("/admin");
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      id: restaurantId,
      brandId: deal.brandId,
    },
    select: { id: true },
  });

  if (!restaurant) {
    redirect("/admin");
  }

  await prisma.dealLocationParticipation.upsert({
    where: {
      dealId_restaurantId: {
        dealId,
        restaurantId,
      },
    },
    update: {
      status: PARTICIPATION_STATUS_NON_PARTICIPATING,
      source: session.user.role === "ADMIN" ? "ADMIN_DIRECT" : "OWNER_DIRECT",
      updatedById: session.user.id,
      notes: "Marked unavailable by a trusted manager.",
    },
    create: {
      dealId,
      restaurantId,
      status: PARTICIPATION_STATUS_NON_PARTICIPATING,
      source: session.user.role === "ADMIN" ? "ADMIN_DIRECT" : "OWNER_DIRECT",
      updatedById: session.user.id,
      notes: "Marked unavailable by a trusted manager.",
    },
  });

  revalidateDealExperience(dealId);
}

export async function approveParticipationReview(reviewId: string) {
  const review = await prisma.dealLocationParticipationReview.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      dealId: true,
      restaurantId: true,
      requestedStatus: true,
    },
  });

  if (!review) {
    redirect("/admin");
  }

  if (!PARTICIPATION_STATUSES.has(review.requestedStatus)) {
    throw new Error("Invalid participation status on review.");
  }

  const session = await requireDealManager(review.dealId);

  if (review.requestedStatus === PARTICIPATION_STATUS_NON_PARTICIPATING) {
    const reviewDeal = await prisma.deal.findUnique({
      where: { id: review.dealId },
      select: { brandId: true },
    });

    if (!reviewDeal?.brandId) {
      redirect("/admin");
    }

    await ensureCanRemoveParticipatingLocation(review.dealId, reviewDeal.brandId, review.restaurantId);
  }

  await prisma.$transaction(async (tx: ParticipationReviewTransaction) => {
    const updated = await tx.dealLocationParticipationReview.updateMany({
      where: {
        id: reviewId,
        status: "PENDING",
      },
      data: {
        status: "APPROVED",
        reviewedById: session.user.id,
        reviewedAt: new Date(),
      },
    });

    if (updated.count !== 1) {
      throw new Error("Participation review was already processed.");
    }

    await tx.dealLocationParticipation.upsert({
      where: {
        dealId_restaurantId: {
          dealId: review.dealId,
          restaurantId: review.restaurantId,
        },
      },
      update: {
        status: review.requestedStatus,
        source: "REVIEW_APPROVED",
        updatedById: session.user.id,
      },
      create: {
        dealId: review.dealId,
        restaurantId: review.restaurantId,
        status: review.requestedStatus,
        source: "REVIEW_APPROVED",
        updatedById: session.user.id,
      },
    });
  });

  revalidateDealExperience(review.dealId);
}

export async function rejectParticipationReview(reviewId: string) {
  const review = await prisma.dealLocationParticipationReview.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      dealId: true,
    },
  });

  if (!review) {
    redirect("/admin");
  }

  const session = await requireDealManager(review.dealId);

  const updated = await prisma.dealLocationParticipationReview.updateMany({
    where: {
      id: reviewId,
      status: "PENDING",
    },
    data: {
      status: "REJECTED",
      reviewedById: session.user.id,
      reviewedAt: new Date(),
    },
  });

  if (updated.count !== 1) {
    throw new Error("Participation review was already processed.");
  }

  revalidateDealExperience(review.dealId);
}
