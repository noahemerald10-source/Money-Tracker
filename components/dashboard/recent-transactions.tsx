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

const necessityConfig: Record<string, { label: string; color: string }> = {
  need: { label: "Need", color: "text-blue-400 bg-blue-500/10" },
  want: { label: "Want", color: "text-amber-400 bg-amber-500/10" },
  waste: { label: "Waste", color: "text-red-400 bg-red-500/10" },
};

export function RecentTransactions({ transactions }: Props) {
  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-card h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Last {transactions.length} entries</p>
        </div>
        <Link
          href="/transactions"
          className="flex items-center gap-1 rounded-lg border border-border/60 bg-secondary/40 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
        >
          View all
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-border/40">
        {transactions.map((t) => {
          const nConfig = necessityConfig[t.necessityLabel] || { label: t.necessityLabel, color: "text-muted-foreground bg-secondary" };
          const emoji = categoryIcons[t.category.toLowerCase()] || "💰";
          return (
            <div
              key={t.id}
              className="group flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-secondary/20"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/60 text-base flex-shrink-0">
                  {emoji}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate leading-tight">
                    {t.description || t.category}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-muted-foreground/60">{t.category}</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-[11px] text-muted-foreground/60">{formatDate(t.date)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0 ml-3">
                <span className={`hidden sm:inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${nConfig.color}`}>
                  {nConfig.label}
                </span>
                <div className="flex items-center gap-1">
                  {t.type === "income" ? (
                    <ArrowUp className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-400" />
                  )}
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      t.type === "income" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {transactions.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-muted-foreground/60">No transactions yet</p>
            <p className="text-xs text-muted-foreground/40 mt-1">Add your first transaction to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
