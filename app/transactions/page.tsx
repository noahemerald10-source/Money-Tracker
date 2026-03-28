'use client'

import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function TransactionsPage() {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [financeMode, setFinanceMode] = useState<'personal' | 'business'>('personal')
  const [necessityLabel, setNecessityLabel] = useState<'need' | 'want' | 'waste'>('need')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState<Status>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: Number(amount),
          category,
          description,
          date: new Date(date),
          financeMode,
          necessityLabel,
        }),
      })

      if (!res.ok) throw new Error('Failed')

      setStatus('success')
      setAmount('')
      setCategory('')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])

      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-400/60 mb-2 font-medium">
            MoneyTrack
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Add Transaction</h1>
          <p className="mt-2 text-zinc-400 text-sm">Record a new income or expense.</p>
        </div>

        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/70 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Type toggle */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 font-medium mb-3">
                Type
              </label>
              <div className="flex rounded-xl border border-zinc-800 bg-zinc-900 p-1 gap-1">
                {(['expense', 'income'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition ${
                      type === t
                        ? t === 'income'
                          ? 'bg-emerald-500 text-black'
                          : 'bg-rose-500 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount + Date row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 font-medium mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-7 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 font-medium mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 font-medium mb-2">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Food, Rent, Salary"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 font-medium mb-2">
                Description <span className="normal-case text-zinc-600">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Add a note..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition"
              />
            </div>

            {/* Finance mode + Necessity row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 font-medium mb-2">
                  Mode
                </label>
                <select
                  value={financeMode}
                  onChange={(e) => setFinanceMode(e.target.value as 'personal' | 'business')}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition"
                >
                  <option value="personal">Personal</option>
                  <option value="business">Business</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 font-medium mb-2">
                  Necessity
                </label>
                <select
                  value={necessityLabel}
                  onChange={(e) => setNecessityLabel(e.target.value as 'need' | 'want' | 'waste')}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition"
                >
                  <option value="need">Need</option>
                  <option value="want">Want</option>
                  <option value="waste">Waste</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Saving…' : 'Save Transaction'}
              </button>

              {status === 'success' && (
                <p className="mt-3 text-center text-sm text-emerald-400">
                  Transaction saved successfully.
                </p>
              )}
              {status === 'error' && (
                <p className="mt-3 text-center text-sm text-rose-400">
                  Something went wrong. Please try again.
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <a href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-300 transition">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
