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
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Filter,
  X,
} from "lucide-react";

interface Props {
  initialTransactions: Transaction[];
}

type SortKey = "date" | "amount" | "category" | "type";
type SortDir = "asc" | "desc";

const necessityVariants: Record<string, "success" | "warning" | "danger"> = {
  need: "success",
  want: "warning",
  waste: "danger",
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
        (t) =>
          t.description?.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.subcategory?.toLowerCase().includes(q)
      );
    }
    if (filterType !== "all") result = result.filter((t) => t.type === filterType);
    if (filterCategory !== "all") result = result.filter((t) => t.category === filterCategory);
    if (filterMode !== "all") result = result.filter((t) => t.financeMode === filterMode);
    if (filterNecessity !== "all") result = result.filter((t) => t.necessityLabel === filterNecessity);

    result.sort((a, b) => {
      let va: number | string, vb: number | string;
      if (sortKey === "date") {
        va = new Date(a.date).getTime();
        vb = new Date(b.date).getTime();
      } else if (sortKey === "amount") {
        va = a.amount;
        vb = b.amount;
      } else if (sortKey === "category") {
        va = a.category;
        vb = b.category;
      } else {
        va = a.type;
        vb = b.type;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [transactions, search, filterType, filterCategory, filterMode, filterNecessity, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast({ title: "Transaction deleted" });
    } catch {
      toast({ title: "Error deleting transaction", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterType("all");
    setFilterCategory("all");
    setFilterMode("all");
    setFilterNecessity("all");
  };

  const hasFilters =
    search || filterType !== "all" || filterCategory !== "all" || filterMode !== "all" || filterNecessity !== "all";

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={14} className="text-muted-foreground" />;
    return sortDir === "asc" ? <ChevronUp size={14} className="text-primary" /> : <ChevronDown size={14} className="text-primary" />;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">Finance</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground/70 mt-0.5">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== transactions.length && ` · filtered from ${transactions.length}`}
          </p>
        </div>
        <Link href="/transactions/new">
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-blue">
            <Plus size={15} />
            Add Transaction
          </Button>
        </Link>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3 shadow-card">
          <p className="text-xs text-muted-foreground/60 mb-1">Income</p>
          <p className="text-lg font-bold text-emerald-400 tabular-nums">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3 shadow-card">
          <p className="text-xs text-muted-foreground/60 mb-1">Expenses</p>
          <p className="text-lg font-bold text-red-400 tabular-nums">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3 shadow-card">
          <p className="text-xs text-muted-foreground/60 mb-1">Net</p>
          <p className={`text-lg font-bold tabular-nums ${totalIncome - totalExpenses >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-card">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter size={14} />
          <span>Filters</span>
        </div>
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="pl-8 h-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TRANSACTION_TYPES.map((t) => (
              <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {allCategories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterMode} onValueChange={setFilterMode}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            {FINANCE_MODES.map((m) => (
              <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterNecessity} onValueChange={setFilterNecessity}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Label" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Labels</SelectItem>
            {NECESSITY_LABELS.map((l) => (
              <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs h-9">
            <X size={12} /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("date")}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    Date <SortIcon col="date" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("category")}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    Category <SortIcon col="category" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("type")}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    Type <SortIcon col="type" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Mode
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Label
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort("amount")}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground ml-auto"
                  >
                    Amount <SortIcon col="amount" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className={`hover:bg-muted/20 transition-colors ${
                    t.type === "income" ? "border-l-2 border-l-emerald-500/30" : "border-l-2 border-l-red-500/30"
                  }`}
                >
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(t.date)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{t.description || "—"}</p>
                    {t.subcategory && (
                      <p className="text-xs text-muted-foreground">{t.subcategory}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.category}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={t.type === "income" ? "success" : "danger"}
                      className="capitalize"
                    >
                      {t.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={t.financeMode === "personal" ? "info" : "secondary"} className="capitalize">
                      {t.financeMode}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={necessityVariants[t.necessityLabel] || "outline"} className="capitalize">
                      {t.necessityLabel}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-semibold ${
                        t.type === "income" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/transactions/${t.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil size={13} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
