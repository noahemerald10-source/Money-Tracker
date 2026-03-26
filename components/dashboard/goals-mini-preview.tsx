"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { SavingsGoal } from "@/types";
import { ArrowUpRight, Target } from "lucide-react";

interface Props {
  goals: SavingsGoal[];
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  high:   { label: "High",   color: "#EF4444" },
  medium: { label: "Medium", color: "#10B981" },
  low:    { label: "Low",    color: "#10B981" },
};

export function GoalsMiniPreview({ goals }: Props) {
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
            <h3 className="text-sm font-bold text-white">Savings Goals</h3>
          </div>
          <p className="text-xs mt-0.5 ml-7" style={{ color: "#6B7280" }}>{goals.length} active goal{goals.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/goals"
          className="gold-link flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
        >
          View all
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="px-5 py-4 space-y-5">
        {goals.map((goal) => {
          const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const pConfig = priorityConfig[goal.priority] || { label: goal.priority, color: "#6B7280" };
          const remaining = goal.targetAmount - goal.currentAmount;
          const isComplete = progress >= 100;

          return (
            <div key={goal.id} className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-white truncate leading-tight">{goal.title}</p>
                <div
                  className="flex items-center gap-1 flex-shrink-0 rounded-md px-1.5 py-0.5"
                  style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.12)" }}
                >
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: pConfig.color }} />
                  <span className="text-[10px] font-medium" style={{ color: "#9CA3AF" }}>{pConfig.label}</span>
                </div>
              </div>

              {/* Gold progress bar */}
              <div className="relative h-[10px] w-full rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                    background: isComplete
                      ? "linear-gradient(90deg, #10B981, #34d399)"
                      : "linear-gradient(90deg, #10B981, #34D399)",
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold tabular-nums" style={{ color: "#10B981" }}>{formatCurrency(goal.currentAmount)}</span>
                <span style={{ color: "#6B7280" }}>
                  {isComplete ? "Complete! 🎉" : `${progress}% · ${formatCurrency(remaining)} left`}
                </span>
                <span className="tabular-nums" style={{ color: "#6B7280" }}>{formatCurrency(goal.targetAmount)}</span>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="py-8 text-center">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl mx-auto mb-3"
              style={{ background: "rgba(16,185,129,0.08)" }}
            >
              <Target className="h-5 w-5" style={{ color: "rgba(16,185,129,0.4)" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "#6B7280" }}>No goals yet</p>
            <p className="text-xs mt-1" style={{ color: "rgba(107,114,128,0.6)" }}>Create a goal to start tracking</p>
          </div>
        )}
      </div>
    </div>
  );
}
