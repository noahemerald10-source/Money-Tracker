"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { WeeklyReview } from "@/types";
import { formatCurrency, calcSavingsRate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  TrendingUp, TrendingDown, PiggyBank, AlertTriangle,
  Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronUp,
  ClipboardList, Smile, Meh, Frown,
} from "lucide-react";

interface Props {
  initialReviews: WeeklyReview[];
}

const reviewSchema = z.object({
  weekStart: z.string().min(1),
  weekEnd: z.string().min(1),
  totalIncome: z.coerce.number().min(0),
  totalExpenses: z.coerce.number().min(0),
  totalSaved: z.coerce.number(),
  wasteSpending: z.coerce.number().min(0),
  notes: z.string().optional(),
  improvementPlan: z.string().optional(),
});

type FormData = z.infer<typeof reviewSchema>;

export function WeeklyReviewClient({ initialReviews }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [reviews, setReviews] = useState<WeeklyReview[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<WeeklyReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(reviews[0]?.id ?? null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const now = new Date();
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      weekStart: format(currentWeekStart, "yyyy-MM-dd"),
      weekEnd: format(currentWeekEnd, "yyyy-MM-dd"),
      totalIncome: 0, totalExpenses: 0, totalSaved: 0, wasteSpending: 0,
      notes: "", improvementPlan: "",
    },
  });

  const startEdit = (review: WeeklyReview) => {
    setEditingReview(review);
    reset({
      weekStart: format(new Date(review.weekStart), "yyyy-MM-dd"),
      weekEnd: format(new Date(review.weekEnd), "yyyy-MM-dd"),
      totalIncome: review.totalIncome,
      totalExpenses: review.totalExpenses,
      totalSaved: review.totalSaved,
      wasteSpending: review.wasteSpending,
      notes: review.notes || "",
      improvementPlan: review.improvementPlan || "",
    });
    setShowForm(true);
  };

  const startNew = () => {
    setEditingReview(null);
    reset({
      weekStart: format(currentWeekStart, "yyyy-MM-dd"),
      weekEnd: format(currentWeekEnd, "yyyy-MM-dd"),
      totalIncome: 0, totalExpenses: 0, totalSaved: 0, wasteSpending: 0,
      notes: "", improvementPlan: "",
    });
    setShowForm(true);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const url = editingReview ? `/api/weekly-reviews/${editingReview.id}` : "/api/weekly-reviews";
      const method = editingReview ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      const saved = await res.json();
      const serialized: WeeklyReview = {
        ...saved,
        weekStart: new Date(saved.weekStart).toISOString(),
        weekEnd: new Date(saved.weekEnd).toISOString(),
        createdAt: new Date(saved.createdAt).toISOString(),
      };
      if (editingReview) {
        setReviews((prev) => prev.map((r) => (r.id === editingReview.id ? serialized : r)));
        toast({ title: "Review updated" });
      } else {
        setReviews((prev) => [serialized, ...prev]);
        toast({ title: "Review saved!" });
      }
      setShowForm(false);
      setEditingReview(null);
      setExpandedId(serialized.id);
      router.refresh();
    } catch {
      toast({ title: "Couldn't save review", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this weekly review? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/weekly-reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Review deleted" });
      router.refresh();
    } catch {
      toast({ title: "Couldn't delete review", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest mb-1">Reflection</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Weekly Review</h1>
          <p className="text-sm text-muted-foreground/70 mt-0.5">
            Look back on your week, spot patterns, and plan ahead
          </p>
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-2.5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all duration-150"
        >
          <Plus size={18} />
          This week
        </button>
      </div>

      {/* New/Edit Form */}
      {showForm && (
        <div className="rounded-xl border border-primary/30 bg-card p-6 shadow-card space-y-5">
          <h3 className="text-sm font-semibold text-foreground">
            {editingReview ? "Edit Review" : "How did this week go?"}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Week starts</Label>
                <Input type="date" {...register("weekStart")} className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Week ends</Label>
                <Input type="date" {...register("weekEnd")} className="h-9" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Total earned ($)</Label>
                <Input type="number" step="0.01" {...register("totalIncome")} className="h-9" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Total spent ($)</Label>
                <Input type="number" step="0.01" {...register("totalExpenses")} className="h-9" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Amount saved ($)</Label>
                <Input type="number" step="0.01" {...register("totalSaved")} className="h-9" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Wasted on things I regret ($)</Label>
                <Input type="number" step="0.01" {...register("wasteSpending")} className="h-9" placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">How did the week go? Any wins or slip-ups?</Label>
              <Textarea placeholder="e.g. Ate out too much but hit my savings target…" rows={3} {...register("notes")} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">What will you do differently next week?</Label>
              <Textarea placeholder="e.g. Meal prep on Sunday, skip the daily coffee…" rows={3} {...register("improvementPlan")} />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 size={15} className="mr-2 animate-spin" />}
                {editingReview ? "Save changes" : "Save review"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingReview(null); }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Empty state */}
      {reviews.length === 0 && !showForm && (
        <div className="rounded-xl border border-border/60 bg-card p-16 text-center shadow-card">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/60 mx-auto mb-4">
            <ClipboardList className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No weekly reviews yet</h3>
          <p className="text-sm text-muted-foreground/60 mb-5 max-w-xs mx-auto">
            Take 5 minutes at the end of each week to reflect on your spending. Small habits lead to big changes.
          </p>
          <Button onClick={startNew} className="gap-2"><Plus size={15} /> Start your first review</Button>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((review) => {
            const isExpanded = expandedId === review.id;
            const savingsRate = calcSavingsRate(review.totalIncome, review.totalExpenses);
            const wastePercent = review.totalExpenses > 0 ? Math.round((review.wasteSpending / review.totalExpenses) * 100) : 0;
            const MoodIcon = savingsRate >= 20 ? Smile : savingsRate >= 0 ? Meh : Frown;
            const moodColor = savingsRate >= 20 ? "text-emerald-400" : savingsRate >= 0 ? "text-amber-400" : "text-red-400";

            return (
              <div key={review.id} className="rounded-xl border border-border/60 bg-card shadow-card overflow-hidden">
                <button className="w-full text-left" onClick={() => setExpandedId(isExpanded ? null : review.id)}>
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <MoodIcon size={18} className={moodColor} />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {format(new Date(review.weekStart), "MMM d")} – {format(new Date(review.weekEnd), "MMM d, yyyy")}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-emerald-400 font-medium">+{formatCurrency(review.totalIncome)}</span>
                          <span className="text-xs text-muted-foreground/30">·</span>
                          <span className="text-xs text-red-400 font-medium">−{formatCurrency(review.totalExpenses)}</span>
                          <span className="text-xs text-muted-foreground/30">·</span>
                          <span className="text-xs text-blue-400 font-medium">{savingsRate}% saved</span>
                          {review.wasteSpending > 0 && (
                            <>
                              <span className="text-xs text-muted-foreground/30">·</span>
                              <span className="text-xs text-amber-400 flex items-center gap-1">
                                <AlertTriangle size={10} />{formatCurrency(review.wasteSpending)} wasted
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-muted-foreground/50" /> : <ChevronDown size={16} className="text-muted-foreground/50" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 border-t border-border/40">
                    {/* Stats grid */}
                    <div className="grid grid-cols-4 gap-3 pt-4">
                      {[
                        { label: "Earned", value: formatCurrency(review.totalIncome), icon: TrendingUp, color: "text-emerald-400" },
                        { label: "Spent",  value: formatCurrency(review.totalExpenses), icon: TrendingDown, color: "text-red-400" },
                        { label: "Saved",  value: formatCurrency(review.totalSaved), icon: PiggyBank, color: "text-blue-400" },
                        { label: "Wasted", value: formatCurrency(review.wasteSpending), icon: AlertTriangle, color: "text-amber-400" },
                      ].map((stat) => {
                        const Icon = stat.icon;
                        return (
                          <div key={stat.label} className="rounded-lg bg-secondary/30 px-3 py-2.5 text-center">
                            <Icon size={13} className={`mx-auto mb-1 ${stat.color}`} />
                            <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-[10px] text-muted-foreground/60">{stat.label}</p>
                          </div>
                        );
                      })}
                    </div>

                    {wastePercent > 15 && (
                      <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                        <AlertTriangle size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-300">
                          <strong>{wastePercent}%</strong> of your spending went on things you regret. Something to think about for next week.
                        </p>
                      </div>
                    )}

                    {review.notes && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Reflection</p>
                        <p className="text-sm text-foreground leading-relaxed">{review.notes}</p>
                      </div>
                    )}

                    {review.improvementPlan && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Plan for next week</p>
                        <p className="text-sm text-foreground leading-relaxed">{review.improvementPlan}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                      <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => startEdit(review)}>
                        <Pencil size={11} /> Edit
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        className="h-8 w-8 p-0 text-red-400/50 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
