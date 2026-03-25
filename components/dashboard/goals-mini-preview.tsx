import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { SavingsGoal } from "@/types";
import { ArrowUpRight, Target } from "lucide-react";

interface Props {
  goals: SavingsGoal[];
}

const priorityConfig: Record<string, { label: string; dot: string }> = {
  high: { label: "High", dot: "bg-red-400" },
  medium: { label: "Medium", dot: "bg-amber-400" },
  low: { label: "Low", dot: "bg-emerald-400" },
};

const progressColors = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6"];

export function GoalsMiniPreview({ goals }: Props) {
  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-card h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Savings Goals</h3>
          <p className="text-xs text-muted-foreground/60 mt-0.5">{goals.length} active goal{goals.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/goals"
          className="flex items-center gap-1 rounded-lg border border-border/60 bg-secondary/40 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
        >
          View all
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="px-5 py-4 space-y-5">
        {goals.map((goal, i) => {
          const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const pConfig = priorityConfig[goal.priority] || { label: goal.priority, dot: "bg-muted-foreground" };
          const color = progressColors[i % progressColors.length];
          const remaining = goal.targetAmount - goal.currentAmount;

          return (
            <div key={goal.id} className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground truncate leading-tight">{goal.title}</p>
                <div className={`flex items-center gap-1 flex-shrink-0 rounded-md px-1.5 py-0.5 bg-secondary/60`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${pConfig.dot}`} />
                  <span className="text-[10px] font-medium text-muted-foreground/70">{pConfig.label}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress}%`, background: color }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold tabular-nums" style={{ color }}>{formatCurrency(goal.currentAmount)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground/50">{progress}% · {formatCurrency(remaining)} left</span>
                </div>
                <span className="text-muted-foreground/60 tabular-nums">{formatCurrency(goal.targetAmount)}</span>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/60 mx-auto mb-3">
              <Target className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground/60">No goals yet</p>
            <p className="text-xs text-muted-foreground/40 mt-1">Create a goal to start tracking</p>
          </div>
        )}
      </div>
    </div>
  );
}
