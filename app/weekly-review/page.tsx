export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { WeeklyReviewClient } from '@/components/weekly-review/weekly-review-client'

export default async function WeeklyReviewPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const reviews = await prisma.weeklyReview.findMany({
    where: { userId },
    orderBy: { weekStart: 'desc' },
  })

  const serialized = reviews.map((r) => ({
    ...r,
    weekStart: r.weekStart.toISOString(),
    weekEnd: r.weekEnd.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }))

  return <WeeklyReviewClient initialReviews={serialized} />
}
