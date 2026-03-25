"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { WeeklyReview } from "@/types";
import { formatCurrency, formatDate, calcSavingsRate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
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
  const [reviews, setReviews] = useState<WeeklyReview[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<WeeklyReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(reviews[0]?.id ?? null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const now = new Date();
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      weekStart: format(currentWeekStart, "yyyy-MM-dd"),
      weekEnd: format(currentWeekEnd, "yyyy-MM-dd"),
      totalIncome: 0,
      totalExpenses: 0,
      totalSaved: 0,
      wasteSpending: 0,
      notes: "",
      improvementPlan: "",
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
      totalIncome: 0,
      totalExpenses: 0,
      totalSaved: 0,
      wasteSpending: 0,
      notes: "",
      improvementPlan: "",
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const url = editingReview
        ? `/api/weekly-reviews/${editingReview.id}`
        : "/api/weekly-reviews";
      const method = editingReview ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

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
        toast({ title: "Review created" });
      }

      setShowForm(false);
      setEditingReview(null);
      setExpandedId(serialized.id);
    } catch {
      toast({ title: "Error saving review", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this weekly review?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/weekly-reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Review deleted" });
    } catch {
      toast({ title: "Error deleting review", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Weekly Review</h1>
          <p className="text-muted-foreground mt-1">Reflect, learn, and improve your finances</p>
        </div>
        <Button onClick={startNew} className="gap-2">
          <Plus size={16} />
          New Review
        </Button>
      </div>

      {/* New/Edit Form */}
      {showForm && (
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="text-base">
              {editingReview ? "Edit Review" : "New Weekly Review"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Week Start</Label>
                  <Input type="date" {...register("weekStart")} />
                </div>
                <div className="space-y-2">
                  <Label>Week End</Label>
                  <Input type="date" {...register("weekEnd")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Income ($)</Label>
                  <Input type="number" step="0.01" {...register("totalIncome")} />
                </div>
                <div className="space-y-2">
                  <Label>Total Expenses ($)</Label>
                  <Input type="number" step="0.01" {...register("totalExpenses")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Saved ($)</Label>
                  <Input type="number" step="0.01" {...register("totalSaved")} />
                </div>
                <div className="space-y-2">
                  <Label>Waste Spending ($)</Label>
                  <Input type="number" step="0.01" {...register("wasteSpending")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="How did the week go? What went well? What didn't?"
                  rows={3}
                  {...register("notes")}
                />
              </div>

              <div className="space-y-2">
                <Label>Improvement Plan</Label>
                <Textarea
                  placeholder="What will you do differently next week?"
                  rows={3}
                  {...register("improvementPlan")}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading && <Loader2 size={16} className="mr-2 animate-spin" />}
                  {editingReview ? "Update Review" : "Save Review"}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => {
          const isExpanded = expandedId === review.id;
          const savingsRate = calcSavingsRate(review.totalIncome, review.totalExpenses);
          const wastePercent = review.totalExpenses > 0
            ? Math.round((review.wasteSpending / review.totalExpenses) * 100)
            : 0;

          return (
            <Card key={review.id} className="border-border/50">
              <button
                className="w-full text-left"
                onClick={() => setExpandedId(isExpanded ? null : review.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {format(new Date(review.weekStart), "MMM d")} – {format(new Date(review.weekEnd), "MMM d, yyyy")}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-emerald-400 font-medium">
                          +{formatCurrency(review.totalIncome)}
                        </span>
                        <span className="text-xs text-muted-foreground">|</span>
                        <span className="text-xs text-red-400 font-medium">
                          -{formatCurrency(review.totalExpenses)}
                        </span>
                        <span className="text-xs text-muted-foreground">|</span>
                        <span className="text-xs text-blue-400 font-medium">
                          {savingsRate}% saved
                        </span>
                        {review.wasteSpending > 0 && (
                          <>
                            <span className="text-xs text-muted-foreground">|</span>
                            <span className="text-xs text-amber-400 flex items-center gap-1">
                              <AlertTriangle size={10} />
                              {formatCurrency(review.wasteSpending)} waste
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                    </div>
                  </div>
                </CardHeader>
              </button>

              {isExpanded && (
                <CardContent className="pt-0 space-y-4">
                  <Separator />

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Income", value: formatCurrency(review.totalIncome), icon: TrendingUp, color: "text-emerald-400" },
                      { label: "Expenses", value: formatCurrency(review.totalExpenses), icon: TrendingDown, color: "text-red-400" },
                      { label: "Saved", value: formatCurrency(review.totalSaved), icon: PiggyBank, color: "text-blue-400" },
                      { label: "Waste", value: formatCurrency(review.wasteSpending), icon: AlertTriangle, color: "text-amber-400" },
                    ].map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.label} className="rounded-lg bg-muted/40 px-3 py-2.5 text-center">
                          <Icon size={14} className={`mx-auto mb-1 ${stat.color}`} />
                          <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Waste alert */}
                  {wastePercent > 15 && (
                    <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                      <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-300">
                        Waste spending was <strong>{wastePercent}%</strong> of total expenses this week. Consider cutting unnecessary spending.
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {review.notes && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Notes</p>
                      <p className="text-sm text-foreground leading-relaxed">{review.notes}</p>
                    </div>
                  )}

                  {/* Improvement Plan */}
                  {review.improvementPlan && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Improvement Plan</p>
                      <p className="text-sm text-foreground leading-relaxed">{review.improvementPlan}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 h-8 text-xs"
                      onClick={() => startEdit(review)}
                    >
                      <Pencil size={12} />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleDelete(review.id)}
                      disabled={deletingId === review.id}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {reviews.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
            <p>No weekly reviews yet. Start your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
