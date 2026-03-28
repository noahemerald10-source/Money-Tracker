import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
  })

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const net = income - expenses
  const recent = transactions.slice(0, 10)

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-400/60 mb-2 font-medium">
            MoneyTrack
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-zinc-400 text-sm">Your private financial overview.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
          <div className="rounded-2xl border border-emerald-500/10 bg-zinc-950/70 p-6 flex flex-col gap-1">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Income</p>
            <p className="text-3xl font-semibold text-emerald-400 mt-1">
              ${income.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-rose-500/10 bg-zinc-950/70 p-6 flex flex-col gap-1">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Expenses</p>
            <p className="text-3xl font-semibold text-rose-400 mt-1">
              ${expenses.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-700/40 bg-zinc-950/70 p-6 flex flex-col gap-1">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Net</p>
            <p className={`text-3xl font-semibold mt-1 ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {net >= 0 ? '+' : '-'}${Math.abs(net).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/70 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Recent Transactions</h2>
              {transactions.length > 0 && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  Showing {recent.length} of {transactions.length}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {transactions.length > 10 && (
                <a
                  href="/transactions"
                  className="text-sm text-zinc-400 hover:text-white transition"
                >
                  View all →
                </a>
              )}
              <a
                href="/transactions"
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400 active:scale-95"
              >
                + Add
              </a>
            </div>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-xl">
                💳
              </div>
              <p className="text-zinc-300 font-medium">No transactions yet</p>
              <p className="text-zinc-500 text-sm mt-1">
                Add your first transaction to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {recent.map((t) => {
                const date = new Date(t.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          t.type === 'income' ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">
                          {t.description || t.category}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {t.category}
                          {t.subcategory ? ` · ${t.subcategory}` : ''}
                          {' · '}
                          {date}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-4">
                      <p
                        className={`font-semibold ${
                          t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-zinc-500 capitalize mt-0.5">{t.necessity || t.type}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}