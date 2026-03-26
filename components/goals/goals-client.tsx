"use client";

import { useState } from "react";
import Link from "next/link";
import { SavingsGoal } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Calendar, Target, Trophy, Flame } from "lucide-react";
import { differenceInDays } from "date-fns";

interface Props {
  initialGoals: SavingsGoal[];
}

const priorityConfig: Record<string, { label: string; dot: string; dotColor: string; ring: string }> = {
  high:   { label: "High priority",   dot: "bg-red-400",     dotColor: "#EF4444", ring: "border-red-500/20" },
  medium: { label: "Medium priority", dot: "bg-amber-400",   dotColor: "#10B981", ring: "border-amber-500/20" },
  low:    { label: "Low priority",    dot: "bg-emerald-400", dotColor: "#10B981", ring: "border-emerald-500/20" },
};

const progressColors = ["#10B981", "#34D399", "#059669", "#10b981", "#ef4444", "#a78bfa"];

export function GoalsClient({ initialGoals }: Props) {
  const { toast } = useToast();
  const [goals, setGoals] = useState<SavingsGoal[]>(initialGoals);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this savings goal? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast({ title: "Goal removed" });
    } catch {
      toast({ title: "Couldn't remove goal", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const now = new Date();
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount).length;
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest mb-1">Savings</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">My Goals</h1>
          <p className="text-sm text-muted-foreground/70 mt-0.5">
            {goals.length === 0 ? "Set your first savings goal to get started" : `${completedGoals} of ${goals.length} goals completed`}
          </p>
        </div>
        <Link href="/goals/new">
          <button className="btn-gold flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm shadow-gold-sm">
            <Plus size={18} />
            New Goal
          </button>
        </Link>
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Saved",       value: formatCurrency(totalSaved),  color: "#10B981" },
            { label: "Total Target",      value: formatCurrency(totalTarget), color: "#FFFFFF" },
            { label: "Overall Progress",  value: `${overallPct}%`,            color: "#10B981" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl px-4 py-3 shadow-card" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.12)" }}>
              <p className="text-xs mb-1" style={{ color: "#6B7280" }}>{s.label}</p>
              <p className="text-lg font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {goals.length === 0 && (
        <div className="rounded-xl p-16 text-center shadow-card" style={{ background: "#0f0f0f", border: "1px solid rgba(16,185,129,0.12)" }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl mx-auto mb-4" style={{ background: "rgba(16,185,129,0.08)" }}>
            <Target className="h-7 w-7" style={{ color: "rgba(16,185,129,0.4)" }} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">No savings goals yet</h3>
          <p className="text-sm mb-5" style={{ color: "#6B7280" }}>
            Set a goal — like an emergency fund, vacation, or new laptop — and track your progress here.
          </p>
          <Link href="/goals/new">
            <button className="btn-gold inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm"><Plus size={15} /> Create your first goal</button>
          </Link>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {goals.map((goal, idx) => {
            const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isComplete = goal.currentAmount >= goal.targetAmount;
            const hasDeadline = !!goal.deadline;
            const daysLeft = hasDeadline ? differenceInDays(new Date(goal.deadline!), now) : null;
            const isOverdue = hasDeadline && daysLeft !== null && daysLeft < 0 && !isComplete;
            const config = priorityConfig[goal.priority] || priorityConfig.medium;
            const color = progressColors[idx % progressColors.length];
            const remaining = goal.targetAmount - goal.currentAmount;

            return (
              <div
                key={goal.id}
                className="rounded-xl p-5 shadow-card transition-all duration-200"
                style={{
                  background: "#0f0f0f",
                  border: isComplete ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(16,185,129,0.15)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = isComplete ? "rgba(16,185,129,0.4)" : "rgba(16,185,129,0.3)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = isComplete ? "rgba(16,185,129,0.25)" : "rgba(16,185,129,0.15)"; }}
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isComplete && <Trophy size={15} className="text-emerald-400 flex-shrink-0" />}
                      <h3 className="font-bold text-white text-base truncate">{goal.title}</h3>
                    </div>
                    {goal.notes && (
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: "#6B7280" }}>{goal.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 rounded-md px-2 py-1" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: config.dotColor }} />
                    <span className="text-[10px] font-medium" style={{ color: "#9CA3AF" }}>{config.label}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2 mb-4">
                  <div className="h-[10px] w-full rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${progress}%`, background: isComplete ? "linear-gradient(90deg,#10b981,#34d399)" : "linear-gradient(90deg,#10B981,#34D399)" }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold tabular-nums" style={{ color: isComplete ? "#10b981" : "#10B981" }}>
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span className="font-bold text-sm text-white">{progress}%</span>
                    <span className="tabular-nums" style={{ color: "#6B7280" }}>{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <p className="text-xs" style={{ color: "#6B7280" }}>
                    {isComplete ? "🎉 Goal reached!" : `${formatCurrency(remaining)} still to go`}
                  </p>
                </div>

                {/* Deadline */}
                {hasDeadline && (
                  <div className={`flex items-center gap-1.5 text-xs mb-4 ${isOverdue ? "text-red-400" : ""}`} style={!isOverdue ? { color: "#6B7280" } : {}}>
                    <Calendar size={11} />
                    {isComplete ? (
                      <span>Deadline was {formatDate(goal.deadline!)}</span>
                    ) : isOverdue ? (
                      <span className="font-medium">Overdue by {Math.abs(daysLeft!)} days</span>
                    ) : daysLeft === 0 ? (
                      <span className="font-medium flex items-center gap-1" style={{ color: "#10B981" }}><Flame size={11} /> Due today</span>
                    ) : (
                      <span>{daysLeft} days left · deadline {formatDate(goal.deadline!)}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid rgba(16,185,129,0.08)" }}>
                  <Link href={`/goals/${goal.id}/edit`} className="flex-1">
                    <button
                      className="w-full h-8 text-xs font-semibold rounded-lg transition-all"
                      style={{ border: "1px solid rgba(16,185,129,0.2)", color: "#10B981", background: "transparent" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.08)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <Pencil size={11} className="inline mr-1.5" /> Edit goal
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
    </div>
  );
}
