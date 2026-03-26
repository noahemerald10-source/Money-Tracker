"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Transaction } from "@/types";
import { formatCurrency, formatDate, CATEGORIES, FINANCE_MODES, NECESSITY_LABELS, TRANSACTION_TYPES } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus, Search, Pencil, Trash2, ArrowUpDown, ChevronUp, ChevronDown,
  Filter, X, ArrowLeftRight, ArrowUp, ArrowDown,
} from "lucide-react";

interface Props {
  initialTransactions: Transaction[];
}

type SortKey = "date" | "amount" | "category" | "type";
type SortDir = "asc" | "desc";

const necessityLabels: Record<string, string> = {
  need: "Essential",
  want: "Nice to Have",
  waste: "Wasteful",
};

const necessityColors: Record<string, { bg: string; color: string }> = {
  need:  { bg: "rgba(16,185,129,0.08)", color: "#10B981" },
  want:  { bg: "rgba(156,163,175,0.1)", color: "#9CA3AF" },
  waste: { bg: "rgba(239,68,68,0.1)",   color: "#EF4444" },
};

const categoryIcons: Record<string, string> = {
  food: "🍕", transport: "🚗", housing: "🏠", entertainment: "🎬",
  health: "💊", shopping: "🛍️", utilities: "⚡", salary: "💼",
  freelance: "💻", investment: "📈", groceries: "🛒", dining: "🍽️",
  subscriptions: "📱", other: "💰",
};

export function TransactionsClient({ initialTransactions }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterMode, setFilterMode] = useState("all");
  const [filterNecessity, setFilterNecessity] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const allCategories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  const filtered = useMemo(() => {
    let result = [...transactions];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.description?.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.subcategory?.toLowerCase().includes(q)
      );
    }
    if (filterType !== "all") result = result.filter((t) => t.type === filterType);
    if (filterCategory !== "all") result = result.filter((t) => t.category === filterCategory);
    if (filterMode !== "all") result = result.filter((t) => t.financeMode === filterMode);
    if (filterNecessity !== "all") result = result.filter((t) => t.necessityLabel === filterNecessity);
    result.sort((a, b) => {
      let va: number | string, vb: number | string;
      if (sortKey === "date") { va = new Date(a.date).getTime(); vb = new Date(b.date).getTime(); }
      else if (sortKey === "amount") { va = a.amount; vb = b.amount; }
      else if (sortKey === "category") { va = a.category; vb = b.category; }
      else { va = a.type; vb = b.type; }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [transactions, search, filterType, filterCategory, filterMode, filterNecessity, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast({ title: "Transaction deleted" });
    } catch {
      toast({ title: "Couldn't delete transaction", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearch(""); setFilterType("all"); setFilterCategory("all");
    setFilterMode("all"); setFilterNecessity("all");
  };

  const hasFilters = search || filterType !== "all" || filterCategory !== "all" || filterMode !== "all" || filterNecessity !== "all";
  const totalIncome   = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={13} style={{ color: "rgba(16,185,129,0.3)" }} />;
    return sortDir === "asc"
      ? <ChevronUp size={13} style={{ color: "#10B981" }} />
      : <ChevronDown size={13} style={{ color: "#10B981" }} />;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(16,185,129,0.5)" }}>Finance</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Transactions</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== transactions.length && ` · showing filtered results`}
          </p>
        </div>
        <Link href="/transactions/new">
          <button className="btn-gold flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm shadow-gold-sm">
            <Plus size={18} />
            Add Transaction
          </button>
        </Link>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Money In",  value: totalIncome,              color: "#10B981" },
          { label: "Money Out", value: totalExpenses,            color: "#EF4444" },
          { label: "Net",       value: totalIncome - totalExpenses, color: totalIncome - totalExpenses >= 0 ? "#10B981" : "#EF4444" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl px-4 py-3 shadow-card" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.12)" }}>
            <p className="text-xs mb-1" style={{ color: "#6B7280" }}>{s.label}</p>
            <p className="text-lg font-bold tabular-nums" style={{ color: s.color }}>{formatCurrency(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl p-4 shadow-card" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.12)" }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(16,185,129,0.5)" }}>
          <Filter size={13} />
          <span className="font-semibold">Filter</span>
        </div>
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(16,185,129,0.4)" }} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or category…" className="pl-8 h-9 text-sm" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32 h-9 text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {allCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterMode} onValueChange={setFilterMode}>
          <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Mode" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Personal & Business</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterNecessity} onValueChange={setFilterNecessity}>
          <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="Label" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Labels</SelectItem>
            <SelectItem value="need">Essential</SelectItem>
            <SelectItem value="want">Nice to Have</SelectItem>
            <SelectItem value="waste">Wasteful</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs h-9 hover:text-white" style={{ color: "#6B7280" }}>
            <X size={12} /> Clear all
          </Button>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="rounded-xl p-16 text-center shadow-card" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.12)" }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl mx-auto mb-4" style={{ background: "rgba(16,185,129,0.08)" }}>
            <ArrowLeftRight className="h-7 w-7" style={{ color: "rgba(16,185,129,0.4)" }} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            {hasFilters ? "No transactions match your filters" : "No transactions yet"}
          </h3>
          <p className="text-sm mb-5" style={{ color: "#6B7280" }}>
            {hasFilters
              ? "Try changing your filters or clearing them to see all transactions."
              : "Start tracking your money by adding your first income or expense."}
          </p>
          {hasFilters ? (
            <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
          ) : (
            <Link href="/transactions/new">
              <button className="btn-gold inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm">
                <Plus size={15} /> Add your first transaction
              </button>
            </Link>
          )}
        </div>
      ) : (
        /* Table */
        <div className="rounded-xl overflow-hidden shadow-card" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.12)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(16,185,129,0.1)" }}>
                  <th className="px-5 py-3 text-left">
                    <button onClick={() => handleSort("date")} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:text-white" style={{ color: "rgba(16,185,129,0.6)" }}>
                      Date <SortIcon col="date" />
                    </button>
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(16,185,129,0.6)" }}>Description</th>
                  <th className="px-5 py-3 text-left">
                    <button onClick={() => handleSort("category")} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:text-white" style={{ color: "rgba(16,185,129,0.6)" }}>
                      Category <SortIcon col="category" />
                    </button>
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(16,185,129,0.6)" }}>Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: "rgba(16,185,129,0.6)" }}>Label</th>
                  <th className="px-5 py-3 text-right">
                    <button onClick={() => handleSort("amount")} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:text-white ml-auto" style={{ color: "rgba(16,185,129,0.6)" }}>
                      Amount <SortIcon col="amount" />
                    </button>
                  </th>
                  <th className="px-5 py-3 text-right" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const emoji  = categoryIcons[t.category.toLowerCase()] || "💰";
                  const nStyle = necessityColors[t.necessityLabel] || { bg: "rgba(107,114,128,0.1)", color: "#9CA3AF" };
                  const nLabel = necessityLabels[t.necessityLabel] || t.necessityLabel;
                  return (
                    <tr
                      key={t.id}
                      className="group transition-all duration-150"
                      style={{ borderBottom: "1px solid rgba(16,185,129,0.06)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.04)"; (e.currentTarget as HTMLElement).style.borderLeft = "2px solid #10B981"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderLeft = "none"; }}
                    >
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: "#6B7280" }}>{formatDate(t.date)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{emoji}</span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-white text-sm">{t.description || t.category}</p>
                              {t.isRecurring && t.recurringFrequency && (
                                <span
                                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                                  style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}
                                >
                                  🔁 {t.recurringFrequency.charAt(0).toUpperCase() + t.recurringFrequency.slice(1)}
                                </span>
                              )}
                            </div>
                            {t.subcategory && <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{t.subcategory}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: "#9CA3AF" }}>{t.category}</td>
                      <td className="px-5 py-3.5">
                        <div
                          className="inline-flex items-center gap-1 text-xs font-semibold rounded-md px-2 py-0.5"
                          style={
                            t.type === "income"
                              ? { background: "rgba(16,185,129,0.1)", color: "#10B981" }
                              : { background: "rgba(239,68,68,0.1)", color: "#EF4444" }
                          }
                        >
                          {t.type === "income" ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                          {t.type === "income" ? "Income" : "Expense"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span
                          className="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold"
                          style={{ background: nStyle.bg, color: nStyle.color }}
                        >
                          {nLabel}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`text-sm font-bold tabular-nums ${t.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                          {t.type === "income" ? "+" : "−"}{formatCurrency(t.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/transactions/${t.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-white" style={{ color: "#6B7280" }}>
                              <Pencil size={12} />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDelete(t.id)}
                            disabled={deletingId === t.id}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
