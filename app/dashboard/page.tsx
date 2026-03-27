import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    return <div className="p-10">Not logged in</div>
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  })

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-6">Dashboard</h1>

      {transactions.length === 0 ? (
        <p>No transactions yet</p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((t) => (
            <li key={t.id} className="border p-2">
              ${t.amount} — {t.category}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}