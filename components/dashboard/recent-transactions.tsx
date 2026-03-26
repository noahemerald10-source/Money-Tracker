"use client";

import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Transaction } from "@/types";
import { ArrowUpRight, ArrowUp, ArrowDown } from "lucide-react";

interface Props {
  transactions: Transaction[];
}

const categoryIcons: Record<string, string> = {
  food: "🍕", transport: "🚗", housing: "🏠", entertainment: "🎬",
  health: "💊", shopping: "🛍️", utilities: "⚡", salary: "💼",
  freelance: "💻", investment: "📈", other: "💰",
};

export function RecentTransactions({ transactions }: Props) {
  return (
    <div
      className="rounded-xl shadow-card h-full"
      style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.15)" }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(16,185,129,0.1)" }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="h-[3px] w-5 rounded-full" style={{ background: "linear-gradient(90deg, #10B981, #34D399)" }} />
            <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
          </div>
          <p className="text-xs mt-0.5 ml-7" style={{ color: "#6B7280" }}>Last {transactions.length} entries</p>
        </div>
        <Link
          href="/transactions"
          className="gold-link flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
        >
          View all
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div>
        {transactions.map((t) => {
          const emoji = categoryIcons[t.category.toLowerCase()] || "💰";
          return (
            <div
              key={t.id}
              className="group flex items-center justify-between px-5 py-3.5 transition-all duration-150 cursor-default"
              style={{ borderBottom: "1px solid rgba(16,185,129,0.05)" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(16,185,129,0.04)";
                el.style.borderLeft = "2px solid #10B981";
                el.style.paddingLeft = "18px";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "transparent";
                el.style.borderLeft = "none";
                el.style.paddingLeft = "20px";
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-base flex-shrink-0"
                  style={{ background: "rgba(16,185,129,0.08)" }}
                >
                  {emoji}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate leading-tight">
                    {t.description || t.category}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px]" style={{ color: "#6B7280" }}>{t.category}</span>
                    <span style={{ color: "rgba(107,114,128,0.4)" }}>·</span>
                    <span className="text-[11px]" style={{ color: "#6B7280" }}>{formatDate(t.date)}</span>
                    {t.isRecurring && t.recurringFrequency && (
                      <>
                        <span style={{ color: "rgba(107,114,128,0.4)" }}>·</span>
                        <span className="text-[10px] font-semibold" style={{ color: "#10B981" }}>🔁 {t.recurringFrequency}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                {t.type === "income" ? (
                  <ArrowUp className="h-3 w-3 text-emerald-400" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-400" />
                )}
                <span className={`text-sm font-bold tabular-nums ${t.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                  {formatCurrency(t.amount)}
                </span>
              </div>
            </div>
          );
        })}

        {transactions.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium" style={{ color: "#6B7280" }}>No transactions yet</p>
            <p className="text-xs mt-1" style={{ color: "rgba(107,114,128,0.6)" }}>Add your first transaction to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
