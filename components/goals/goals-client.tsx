"use client";

import { useState } from "react";
import Link from "next/link";
import { SavingsGoal } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Calendar, Target, Trophy } from "lucide-react";
import { differenceInDays, isAfter } from "date-fns";

interface Props {
  initialGoals: SavingsGoal[];
}

const priorityConfig: Record<string, { variant: "danger" | "warning" | "info"; label: string; color: string }> = {
  high: { variant: "danger", label: "High", color: "text-red-400" },
  medium: { variant: "warning", label: "Medium", color: "text-amber-400" },
  low: { variant: "info", label: "Low", color: "text-blue-400" },
};

const progressColors: Record<string, string> = {
  complete: "bg-emerald-500",
  high: "bg-blue-500",
  medium: "bg-amber-500",
  low: "bg-red-500",
};

export function GoalsClient({ initialGoals }: Props) {
  const { toast } = useToast();
  const [goals, setGoals] = useState<SavingsGoal[]>(initialGoals);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this savings goal?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast({ title: "Goal deleted" });
    } catch {
      toast({ title: "Error deleting goal", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const now = new Date();
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Savings Goals</h1>
          <p className="text-muted-foreground mt-1">
            {completedGoals} of {goals.length} goals completed
          </p>
        </div>
        <Link href="/goals/new">
          <Button className="gap-2">
            <Plus size={16} />
            New Goal
          </Button>
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border/50 bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Total Saved</p>
          <p className="text-lg font-bold text-emerald-400">{formatCurrency(totalSaved)}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Total Target</p>
          <p className="text-lg font-bold text-foreground">{formatCurrency(totalTarget)}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Overall Progress</p>
          <p className="text-lg font-bold text-blue-400">
            {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2">
        {goals.map((goal) => {
          const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isComplete = goal.currentAmount >= goal.targetAmount;
          const hasDeadline = !!goal.deadline;
          const daysLeft = hasDeadline
            ? differenceInDays(new Date(goal.deadline!), now)
            : null;
          const isOverdue = hasDeadline && daysLeft !== null && daysLeft < 0 && !isComplete;
          const config = priorityConfig[goal.priority] || priorityConfig.medium;

          const barColor = isComplete
            ? progressColors.complete
            : progress >= 75
            ? progressColors.high
            : progress >= 40
            ? progressColors.medium
            : progressColors.low;

          return (
            <Card
              key={goal.id}
              className={`border-border/50 relative overflow-hidden transition-all hover:border-border ${
                isComplete ? "ring-1 ring-emerald-500/30" : ""
              }`}
            >
              {isComplete && (
                <div className="absolute top-3 right-3">
                  <Trophy size={16} className="text-emerald-400" />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3 pr-6">
                  <div>
                    <h3 className="font-semibold text-foreground text-base">{goal.title}</h3>
                    {goal.notes && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{goal.notes}</p>
                    )}
                  </div>
                  <Badge variant={config.variant} className="flex-shrink-0 mt-0.5">
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span className="font-bold text-lg" style={{ color: isComplete ? "#10b981" : undefined }}>
                      {progress}%
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isComplete
                      ? "Goal achieved!"
                      : `${formatCurrency(goal.targetAmount - goal.currentAmount)} remaining`}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Target size={12} />
                    <span>Priority: <span className={config.color}>{config.label}</span></span>
                  </div>
                  {hasDeadline && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {isComplete ? (
                        <span>Deadline: {formatDate(goal.deadline!)}</span>
                      ) : isOverdue ? (
                        <span className="text-red-400">Overdue by {Math.abs(daysLeft!)} days</span>
                      ) : (
                        <span>
                          {daysLeft === 0 ? "Due today" : `${daysLeft} days left`}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                  <Link href={`/goals/${goal.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1.5 h-8 text-xs">
                      <Pencil size={12} />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => handleDelete(goal.id)}
                    disabled={deletingId === goal.id}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {goals.length === 0 && (
          <div className="col-span-2 py-16 text-center text-muted-foreground">
            <Target size={40} className="mx-auto mb-3 opacity-30" />
            <p>No savings goals yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
