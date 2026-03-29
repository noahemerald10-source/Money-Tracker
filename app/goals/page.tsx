export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { GoalsClient } from '@/components/goals/goals-client'

async function getGoals(userId: string) {
  const goals = await prisma.savingsGoal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return goals.map((g) => ({
    ...g,
    deadline: g.deadline?.toISOString() ?? null,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
  }))
}

export default async function GoalsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const goals = await getGoals(userId)
  return <GoalsClient initialGoals={goals} />
}
