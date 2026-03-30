export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AnalyticsClient } from '@/components/analytics/analytics-client'

export default async function AnalyticsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    select: {
      id: true,
      type: true,
      amount: true,
      category: true,
      date: true,
      financeMode: true,
      necessityLabel: true,
      isRecurring: true,
      recurringFrequency: true,
    },
  })

  // Serialize dates for client
  const serialized = transactions.map((t) => ({
    ...t,
    date: t.date.toISOString(),
  }))

  return <AnalyticsClient transactions={serialized} />
}
