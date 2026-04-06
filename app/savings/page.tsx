"use client";

import { useState, useMemo } from "react";

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseNum(val: string): number {
  const n = parseFloat(val.replace(/,/g, ""));
  return isNaN(n) || n < 0 ? 0 : n;
}

export default function SavingsPage() {
  const [goalAmount, setGoalAmount] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");

  const result = useMemo(() => {
    const goal = parseNum(goalAmount);
    const current = parseNum(currentSavings);
    const monthly = parseNum(monthlyContribution);

    if (goal <= 0) return null;

    const remaining = goal - current;

    if (remaining <= 0) {
      return { reached: true, months: 0, years: 0, remainingMonths: 0, completionDate: null, progress: 100 };
    }

    const progress = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;

    if (monthly <= 0) {
      return { reached: false, months: null, years: null, remainingMonths: null, completionDate: null, progress };
    }

    const months = Math.ceil(remaining / monthly);
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + months);

    return { reached: false, months, years, remainingMonths, completionDate, progress };
  }, [goalAmount, currentSavings, monthlyContribution]);

  const goal = parseNum(goalAmount);
  const current = parseNum(currentSavings);
  const monthly = parseNum(monthlyContribution);
  const remaining = goal > 0 ? Math.max(0, goal - current) : 0;

  return (
    <div className="min-h-screen bg-background text-white px-4 py-6 sm:px-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Header */}
        <div className="pb-2">
          <h1 className="text-3xl font-semibold tracking-[-0.02em] leading-none text-white">
            Savings Calculator
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Find out how long it will take to reach your savings goal.
          </p>
        </div>

        {/* Inputs */}
        <div className="card-section rounded-2xl p-6 space-y-5">
          <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-zinc-500">
            Your Numbers
          </p>

          <div className="space-y-4">
            {/* Goal Amount */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Savings Goal
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">$</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="10,000"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="w-full rounded-xl pl-8 pr-4 py-3 text-sm font-medium text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>
            </div>

            {/* Current Savings */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Current Savings
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">$</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="2,500"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(e.target.value)}
                  className="w-full rounded-xl pl-8 pr-4 py-3 text-sm font-medium text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>
            </div>

            {/* Monthly Contribution */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Monthly Contribution
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">$</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="500"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  className="w-full rounded-xl pl-8 pr-4 py-3 text-sm font-medium text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Result */}
        {result ? (
          <div className="space-y-4">

            {/* Progress bar */}
            <div className="card-section rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-zinc-500">Progress</p>
                <span className="text-xs font-semibold tabular-nums" style={{ color: "#34D399" }}>
                  {result.progress}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${result.progress}%`,
                    background: "linear-gradient(90deg, #10B981, #34D399)",
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-zinc-600 tabular-nums">${fmt(current)} saved</span>
                <span className="text-xs text-zinc-600 tabular-nums">${fmt(goal)} goal</span>
              </div>
            </div>

            {/* Time estimate */}
            {result.reached ? (
              <div
                className="rounded-2xl p-6 flex items-center gap-4"
                style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.15)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(16,185,129,0.12)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10l4.5 4.5L16 6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Goal already reached!</p>
                  <p className="text-xs text-emerald-400 mt-0.5">Your current savings meet or exceed your goal.</p>
                </div>
              </div>
            ) : result.months !== null ? (
              <div className="card-section rounded-2xl p-6 space-y-4">
                <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-zinc-500">
                  Time to Goal
                </p>

                {/* Big time display */}
                <div className="flex items-end gap-4">
                  {result.years > 0 && (
                    <div>
                      <p className="text-4xl font-semibold tracking-[-0.03em] text-white tabular-nums leading-none">
                        {result.years}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">{result.years === 1 ? "year" : "years"}</p>
                    </div>
                  )}
                  {result.remainingMonths > 0 && (
                    <div>
                      <p className="text-4xl font-semibold tracking-[-0.03em] text-white tabular-nums leading-none">
                        {result.remainingMonths}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {result.remainingMonths === 1 ? "month" : "months"}
                      </p>
                    </div>
                  )}
                  {result.years === 0 && result.remainingMonths === 0 && (
                    <div>
                      <p className="text-4xl font-semibold tracking-[-0.03em] text-white tabular-nums leading-none">
                        &lt;1
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">month</p>
                    </div>
                  )}
                </div>

                {/* Completion date */}
                {result.completionDate && (
                  <p className="text-xs text-zinc-500">
                    Projected completion:{" "}
                    <span className="text-zinc-300 font-medium">
                      {result.completionDate.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                )}

                {/* Summary stats */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div
                    className="rounded-xl p-3.5"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <p className="text-[10px] text-zinc-600 mb-1">Still needed</p>
                    <p className="text-base font-semibold tabular-nums text-rose-400">${fmt(remaining)}</p>
                  </div>
                  <div
                    className="rounded-xl p-3.5"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <p className="text-[10px] text-zinc-600 mb-1">Per month</p>
                    <p className="text-base font-semibold tabular-nums text-emerald-400">${fmt(monthly)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="rounded-2xl p-5 flex items-center gap-3"
                style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="shrink-0">
                  <path d="M10 6v5M10 14h.01" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="10" cy="10" r="8" stroke="#F59E0B" strokeWidth="1.5"/>
                </svg>
                <p className="text-sm text-zinc-300">
                  Enter a monthly contribution to calculate your timeline.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div
            className="rounded-2xl p-8 flex flex-col items-center text-center"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.12)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke="#10B981" strokeWidth="1.5"/>
                <path d="M12 8v4l3 3" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-400">Enter a savings goal to get started</p>
            <p className="text-xs text-zinc-600 mt-1.5 max-w-[240px] leading-relaxed">
              Fill in the fields above and your projected timeline will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
