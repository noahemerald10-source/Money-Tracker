import { prisma } from "@/lib/prisma";
import { WeeklyReviewClient } from "@/components/weekly-review/weekly-review-client";

async function getData() {
  const reviews = await prisma.weeklyReview.findMany({
    orderBy: { weekStart: "desc" },
  });

  return reviews.map((r) => ({
    ...r,
    weekStart: r.weekStart.toISOString(),
    weekEnd: r.weekEnd.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }));
}

export default async function WeeklyReviewPage() {
  const reviews = await getData();
  return <WeeklyReviewClient initialReviews={reviews} />;
}
