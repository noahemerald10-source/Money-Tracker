'use client'

import { useState } from 'react'

export default function TransactionsPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: '',
    subcategory: '',
    description: '',
    financeMode: 'personal',
    necessityLabel: 'need',
  })

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          date: new Date().toISOString(),
        }),
      })

      if (!res.ok) {
        throw new Error('Failed')
      }

      alert('Transaction added ✅')

      setForm({
        type: 'expense',
        amount: '',
        category: '',
        subcategory: '',
        description: '',
        financeMode: 'personal',
        necessityLabel: 'need',
      })
    } catch (error) {
      alert('Failed to save transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-400/70 mb-2">
            MoneyTrack
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Add Transaction</h1>
          <p className="mt-2 text-zinc-400">
            Add a new income or expense to your private finance system.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/10 bg-zinc-950/70 p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Type</label>
              <select
                value={form.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Amount</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => updateField('amount', e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Category</label>
              <input
                type="text"
                placeholder="Food, Rent, Sales..."
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Subcategory</label>
              <input
                type="text"
                placeholder="Optional"
                value={form.subcategory}
                onChange={(e) => updateField('subcategory', e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Finance Mode</label>
              <select
                value={form.financeMode}
                onChange={(e) => updateField('financeMode', e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
              >
                <option value="personal">Personal</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Need / Want / Waste</label>
              <select
                value={form.necessityLabel}
                onChange={(e) => updateField('necessityLabel', e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
              >
                <option value="need">Need</option>
                <option value="want">Want</option>
                <option value="waste">Waste</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-zinc-300">Description</label>
              <textarea
                placeholder="Optional note"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 outline-none focus:border-emerald-400"
              />
            </div>

            <div className="md:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-emerald-500 px-6 py-3 font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Saving...' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}