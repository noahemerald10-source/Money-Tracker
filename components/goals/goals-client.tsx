"use client";

import { useState } from "react";
import Link from "next/link";
import { SavingsGoal } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Calendar, Target, Trophy, Flame, TrendingUp, X, Loader2 } from "lucide-react";
import { differenceInDays } from "date-fns";

interface Props {
  initialGoals: SavingsGoal[];
}

const priorityConfig: Record<string, { label: string; dotColor: string; bg: string; border: string }> = {
  high:   { label: "High",   dotColor: "#EF4444", bg: "rgba(239,68,68,0.08)",    border: "rgba(239,68,68,0.2)"    },
  medium: { label: "Medium", dotColor: "#F59E0B", bg: "rgba(245,158,11,0.08)",   border: "rgba(245,158,11,0.2)"   },
  low:    { label: "Low",    dotColor: "#10B981", bg: "rgba(16,185,129,0.08)",   border: "rgba(16,185,129,0.2)"   },
};

export function GoalsClient({ initialGoals }: Props) {
  const { toast } = useToast();
  const [goals, setGoals] = useState<SavingsGoal[]>(initialGoals);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [quickGoal, setQuickGoal]       = useState<SavingsGoal | null>(null);
  const [quickAmount, setQuickAmount]   = useState("");
  const [saving, setSaving]             = useState(false);

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Remove this savings goal? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast({ title: "Goal removed" });
    } catch {
      toast({ title: "Couldn't remove goal", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  // ── Quick progress update ───────────────────────────────────────────────
  const openQuickUpdate = (goal: SavingsGoal) => {
    setQuickGoal(goal);
    setQuickAmount(String(goal.currentAmount));
  };

  const handleQuickSave = async () => {
    if (!quickGoal) return;
    const newAmount = parseFloat(quickAmount);
    if (isNaN(newAmount) || newAmount < 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/goals/${quickGoal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentAmount: newAmount }),
      });
      if (!res.ok) throw new Error();
      setGoals((prev) =>
        prev.map((g) => g.id === quickGoal.id ? { ...g, currentAmount: newAmount } : g)
      );
      toast({ title: "Progress updated!" });
      setQuickGoal(null);
    } catch {
      toast({ title: "Couldn't update progress", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Derived totals ──────────────────────────────────────────────────────
  const now          = new Date();
  const totalSaved   = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget  = goals.reduce((s, g) => s + g.targetAmount,  0);
  const completed    = goals.filter((g) => g.currentAmount >= g.targetAmount).length;
  const overallPct   = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest mb-1">Savings</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">My Goals</h1>
          <p className="text-sm text-muted-foreground/70 mt-0.5">
            {goals.length === 0
              ? "Set your first savings goal to get started"
              : `${completed} of ${goals.length} goals completed`}
          </p>
        </div>
        <Link href="/goals/new">
          <button className="btn-gold flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm shadow-gold-sm">
            <Plus size={18} /> New Goal
          </button>
        </Link>
      </div>

      {/* ── Summary bar ─────────────────────────────────────────────────── */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Saved",      value: formatCurrency(totalSaved),  color: "#10B981" },
            { label: "Total Target",     value: formatCurrency(totalTarget), color: "#FFFFFF" },
            { label: "Overall Progress", value: `${overallPct}%`,            color: "#10B981" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl px-4 py-3"
              style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.12)" }}
            >
              <p className="text-xs mb-1" style={{ color: "#6B7280" }}>{s.label}</p>
              <p className="text-lg font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {goals.length === 0 && (
        <div className="rounded-xl p-16 text-center" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.12)" }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl mx-auto mb-4" style={{ background: "rgba(16,185,129,0.08)" }}>
            <Target className="h-7 w-7" style={{ color: "rgba(16,185,129,0.4)" }} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">No savings goals yet</h3>
          <p className="text-sm mb-5" style={{ color: "#6B7280" }}>
            Set a goal — like an emergency fund, vacation, or new laptop — and track your progress here.
          </p>
          <Link href="/goals/new">
            <button className="btn-gold inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm">
              <Plus size={15} /> Create your first goal
            </button>
          </Link>
        </div>
      )}

      {/* ── Goals Grid ──────────────────────────────────────────────────── */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {goals.map((goal) => {
            const progress   = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isComplete = goal.currentAmount >= goal.targetAmount;
            const hasDeadline = !!goal.deadline;
            const daysLeft    = hasDeadline ? differenceInDays(new Date(goal.deadline!), now) : null;
            const isOverdue   = hasDeadline && daysLeft !== null && daysLeft < 0 && !isComplete;
            const cfg         = priorityConfig[goal.priority] ?? priorityConfig.medium;
            const remaining   = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div
                key={goal.id}
                className="rounded-2xl p-5 transition-all duration-200"
                style={{
                  background: "#0f0f0f",
                  border: isComplete
                    ? "1px solid rgba(16,185,129,0.3)"
                    : "1px solid rgba(16,185,129,0.14)",
                }}
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {isComplete && <Trophy size={14} className="text-emerald-400 shrink-0" />}
                      <h3 className="font-bold text-white text-base truncate">{goal.title}</h3>
                    </div>
                    {goal.notes && (
                      <p className="text-xs line-clamp-2" style={{ color: "#6B7280" }}>{goal.notes}</p>
                    )}
                  </div>
                  {/* Priority badge */}
                  <div
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 shrink-0"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                  >
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.dotColor }} />
                    <span className="text-[10px] font-semibold" style={{ color: "#9CA3AF" }}>{cfg.label}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="h-2.5 w-full rounded-full overflow-hidden mb-2.5" style={{ background: "#1a1a1a" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${progress}%`,
                        background: isComplete
                          ? "linear-gradient(90deg,#10b981,#34d399)"
                          : progress > 66
                          ? "linear-gradient(90deg,#10B981,#34D399)"
                          : progress > 33
                          ? "linear-gradient(90deg,#F59E0B,#FCD34D)"
                          : "linear-gradient(90deg,#EF4444,#F97316)",
                      }}
                    />
                  </div>
                  {/* Amounts row */}
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold tabular-nums" style={{ color: "#10B981" }}>
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span style={{ color: "#4B5563" }}> saved</span>
                    </div>
                    <span
                      className="font-bold text-sm px-2 py-0.5 rounded-md tabular-nums"
                      style={{
                        background: isComplete ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
                        color: isComplete ? "#10B981" : "#FFFFFF",
                      }}
                    >
                      {progress}%
                    </span>
                    <div className="text-right">
                      <span className="font-semibold tabular-nums" style={{ color: "#6B7280" }}>
                        {formatCurrency(goal.targetAmount)}
                      </span>
                      <span style={{ color: "#4B5563" }}> goal</span>
                    </div>
                  </div>
                  {/* Remaining / complete */}
                  <p className="text-xs mt-2" style={{ color: "#6B7280" }}>
                    {isComplete
                      ? "🎉 Goal reached!"
                      : (
                        <span>
                          <span className="font-semibold text-white">{formatCurrency(remaining)}</span> still to go
                          {hasDeadline && daysLeft !== null && !isOverdue && daysLeft > 0 && (
                            <span style={{ color: "#4B5563" }}> · {Math.ceil(remaining / daysLeft * 7)}/wk to hit deadline</span>
                          )}
                        </span>
                      )
                    }
                  </p>
                </div>

                {/* Deadline */}
                {hasDeadline && (
                  <div
                    className="flex items-center gap-1.5 text-xs mb-4"
                    style={{ color: isOverdue ? "#EF4444" : "#6B7280" }}
                  >
                    <Calendar size={11} />
                    {isComplete ? (
                      <span>Deadline was {formatDate(goal.deadline!)}</span>
                    ) : isOverdue ? (
                      <span className="font-semibold">Overdue by {Math.abs(daysLeft!)} days</span>
                    ) : daysLeft === 0 ? (
                      <span className="font-semibold flex items-center gap-1" style={{ color: "#10B981" }}>
                        <Flame size={11} /> Due today
                      </span>
                    ) : (
                      <span>{daysLeft} days left · deadline {formatDate(goal.deadline!)}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div
                  className="flex items-center gap-2 pt-3"
                  style={{ borderTop: "1px solid rgba(16,185,129,0.08)" }}
                >
                  {/* Quick update progress */}
                  <button
                    onClick={() => openQuickUpdate(goal)}
                    className="flex-1 h-8 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all"
                    style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.25)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.18)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.1)"; }}
                  >
                    <TrendingUp size={11} /> Update Progress
                  </button>
                  <Link href={`/goals/${goal.id}/edit`}>
                    <button
                      className="h-8 w-8 flex items-center justify-center rounded-lg transition-all"
                      style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#6B7280", background: "transparent" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#6B7280"; }}
                    >
                      <Pencil size={12} />
                    </button>
                  </Link>
                  <Button
                    variant="ghost" size="sm"
                    className="h-8 w-8 p-0 text-red-400/50 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDelete(goal.id)}
                    disabled={deletingId === goal.id}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Quick update modal ───────────────────────────────────────────── */}
      {quickGoal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setQuickGoal(null); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-5"
            style={{ background: "#111", border: "1px solid rgba(16,185,129,0.2)" }}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-base">{quickGoal.title}</h3>
                <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>Update your saved amount</p>
              </div>
              <button
                onClick={() => setQuickGoal(null)}
                className="h-7 w-7 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: "#6B7280" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#6B7280"; }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Current progress */}
            <div className="rounded-xl p-3.5" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.12)" }}>
              <div className="flex justify-between text-xs mb-2" style={{ color: "#6B7280" }}>
                <span>{formatCurrency(quickGoal.currentAmount)} saved</span>
                <span>{formatCurrency(quickGoal.targetAmount)} goal</span>
              </div>
              <div className="h-2 w-full rounded-full" style={{ background: "#1a1a1a" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((quickGoal.currentAmount / quickGoal.targetAmount) * 100))}%`,
                    background: "linear-gradient(90deg,#10B981,#34D399)",
                  }}
                />
              </div>
            </div>

            {/* Amount input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold" style={{ color: "#9CA3AF" }}>New saved amount ($)</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setQuickAmount((v) => String(Math.max(0, (parseFloat(v) || 0) - 100)))}
                  className="h-10 w-10 shrink-0 rounded-lg text-lg font-semibold transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#9CA3AF", border: "1px solid rgba(255,255,255,0.08)" }}
                >−</button>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  className="h-10 text-center font-bold text-white text-base"
                  onKeyDown={(e) => { if (e.key === "Enter") handleQuickSave(); }}
                  autoFocus
                />
                <button
                  onClick={() => setQuickAmount((v) => String((parseFloat(v) || 0) + 100))}
                  className="h-10 w-10 shrink-0 rounded-lg text-lg font-semibold transition-all"
                  style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}
                >+</button>
              </div>

              {/* Preview new progress */}
              {quickAmount && !isNaN(parseFloat(quickAmount)) && (
                <p className="text-xs text-center" style={{ color: "#6B7280" }}>
                  New progress:{" "}
                  <span style={{ color: "#10B981" }} className="font-semibold">
                    {Math.min(100, Math.round((parseFloat(quickAmount) / quickGoal.targetAmount) * 100))}%
                  </span>
                  {" "}· {formatCurrency(Math.max(0, quickGoal.targetAmount - parseFloat(quickAmount)))} remaining
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleQuickSave}
                disabled={saving}
                className="btn-gold flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm disabled:opacity-60"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save Progress
              </button>
              <button
                onClick={() => setQuickGoal(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold"
                style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#6B7280", background: "transparent" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
