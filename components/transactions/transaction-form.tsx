"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Transaction } from "@/types";
import { CATEGORIES, FINANCE_MODES, NECESSITY_LABELS, TRANSACTION_TYPES } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, ChevronLeft, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { TransactionTemplate } from "@/lib/transaction-templates";

const FREQUENCIES = [
  { value: "weekly",      label: "Weekly" },
  { value: "fortnightly", label: "Fortnightly" },
  { value: "monthly",     label: "Monthly" },
  { value: "quarterly",   label: "Quarterly" },
  { value: "yearly",      label: "Yearly" },
] as const;

type Frequency = typeof FREQUENCIES[number]["value"];

function toWeekly(amount: number, freq: Frequency): number {
  switch (freq) {
    case "weekly":      return amount;
    case "fortnightly": return amount / 2;
    case "monthly":     return (amount * 12) / 52;
    case "quarterly":   return (amount * 4) / 52;
    case "yearly":      return amount / 52;
  }
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  financeMode: z.enum(["personal", "business"]),
  necessityLabel: z.enum(["need", "want", "waste"]),
  recurringStartDate: z.string().optional(),
  recurringEndDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  transaction?: Transaction;
  prefill?: TransactionTemplate;
  onBackToTemplates?: () => void;
}

export function TransactionForm({ transaction, prefill, onBackToTemplates }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(
    transaction?.isRecurring ?? prefill?.isRecurring ?? false
  );
  const [frequency, setFrequency] = useState<Frequency>(
    (transaction?.recurringFrequency as Frequency) ??
    (prefill?.frequency as Frequency) ??
    "monthly"
  );
  const today = format(new Date(), "yyyy-MM-dd");

  const isEdit = !!transaction;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: (transaction?.type as "income" | "expense") ?? prefill?.type ?? "expense",
      amount: transaction?.amount || undefined,
      category: transaction?.category ?? prefill?.category ?? "",
      subcategory: transaction?.subcategory ?? prefill?.subcategory ?? "",
      description: transaction?.description ?? prefill?.description ?? "",
      date: transaction?.date
        ? format(new Date(transaction.date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      financeMode: (transaction?.financeMode as "personal" | "business") ?? prefill?.financeMode ?? "personal",
      necessityLabel: (transaction?.necessityLabel as "need" | "want" | "waste") ?? prefill?.necessityLabel ?? "need",
      recurringStartDate: transaction?.recurringStartDate
        ? format(new Date(transaction.recurringStartDate as string), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      recurringEndDate: transaction?.recurringEndDate
        ? format(new Date(transaction.recurringEndDate as string), "yyyy-MM-dd")
        : "",
    },
  });

  const watchType = watch("type");
  const watchAmount = watch("amount");
  const categories = CATEGORIES[watchType as "income" | "expense"] || CATEGORIES.expense;

  // Live recurring cost breakdown
  const weekly      = isRecurring && watchAmount > 0 ? toWeekly(watchAmount, frequency) : null;
  const fortnightly = weekly !== null ? weekly * 2 : null;
  const monthly     = weekly !== null ? (weekly * 52) / 12 : null;
  const yearly      = weekly !== null ? weekly * 52 : null;

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const url = isEdit ? `/api/transactions/${transaction!.id}` : "/api/transactions";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          isRecurring,
          recurringFrequency: isRecurring ? frequency : null,
          recurringStartDate: isRecurring && data.recurringStartDate ? data.recurringStartDate : null,
          recurringEndDate: isRecurring && data.recurringEndDate ? data.recurringEndDate : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      toast({ title: isEdit ? "Transaction updated" : "Transaction created" });
      router.push("/transactions");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      {onBackToTemplates ? (
        <button
          type="button"
          onClick={onBackToTemplates}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors -ml-1"
          style={{ color: "#6B7280" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#10B981"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#6B7280"; }}
        >
          <ChevronLeft size={16} /> Back to templates
        </button>
      ) : (
        <Link href="/transactions">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
            <ArrowLeft size={16} />
            Back to Transactions
          </Button>
        </Link>
      )}

      {/* Template badge */}
      {prefill && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <span className="text-xl">{prefill.emoji}</span>
          <div>
            <p className="text-xs font-semibold text-white">{prefill.name} template applied</p>
            <p className="text-xs" style={{ color: "#6B7280" }}>
              Fields pre-filled — adjust the amount and anything else before saving.
              {prefill.amountHint && (
                <span style={{ color: "#10B981" }}> Suggested: {prefill.amountHint}</span>
              )}
            </p>
          </div>
        </div>
      )}

      <Card className="border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Type + Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={watchType}
                  onValueChange={(v) => {
                    setValue("type", v as "income" | "expense");
                    setValue("category", "");
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register("amount")} />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
              </div>
            </div>

            {/* Category + Subcategory */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={watch("category")} onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory (optional)</Label>
                <Input id="subcategory" placeholder="e.g. Rent, Netflix..." {...register("subcategory")} />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input id="description" placeholder="Brief description..." {...register("description")} />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>

            {/* Finance Mode + Necessity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Finance Mode</Label>
                <Select value={watch("financeMode")} onValueChange={(v) => setValue("financeMode", v as "personal" | "business")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FINANCE_MODES.map((m) => (
                      <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Necessity Label</Label>
                <Select value={watch("necessityLabel")} onValueChange={(v) => setValue("necessityLabel", v as "need" | "want" | "waste")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NECESSITY_LABELS.map((l) => (
                      <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recurring Toggle */}
            <div className="rounded-xl p-4 space-y-4" style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.15)" }}>
              <label className="flex items-center justify-between cursor-pointer gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
                    style={{ background: isRecurring ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)" }}
                  >
                    <RefreshCw size={16} style={{ color: isRecurring ? "#10B981" : "rgba(107,114,128,0.6)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Recurring expense</p>
                    <p className="text-xs" style={{ color: "#6B7280" }}>This transaction repeats on a schedule</p>
                  </div>
                </div>
                {/* Toggle switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isRecurring}
                  onClick={() => setIsRecurring((v) => !v)}
                  className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
                  style={{ background: isRecurring ? "#10B981" : "#1a1a1a" }}
                >
                  <span
                    className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200"
                    style={{ transform: isRecurring ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </label>

              {isRecurring && (
                <div className="space-y-4 pt-1">
                  {/* Frequency selector */}
                  <div className="space-y-2">
                    <Label className="text-xs" style={{ color: "#9CA3AF" }}>Frequency</Label>
                    <div className="flex flex-wrap gap-2">
                      {FREQUENCIES.map((f) => (
                        <button
                          key={f.value}
                          type="button"
                          onClick={() => setFrequency(f.value)}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                          style={
                            frequency === f.value
                              ? { background: "rgba(16,185,129,0.2)", color: "#10B981", border: "1px solid rgba(16,185,129,0.4)" }
                              : { background: "rgba(255,255,255,0.04)", color: "#6B7280", border: "1px solid rgba(255,255,255,0.08)" }
                          }
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Start / End dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs" style={{ color: "#9CA3AF" }}>Start date</Label>
                      <Input type="date" className="h-9 text-sm" {...register("recurringStartDate")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs" style={{ color: "#9CA3AF" }}>
                        End date <span style={{ color: "#4B5563" }}>(optional)</span>
                      </Label>
                      <Input type="date" className="h-9 text-sm" {...register("recurringEndDate")} />
                    </div>
                  </div>

                  {/* Real-time cost breakdown */}
                  {weekly !== null && (
                    <div className="rounded-lg p-3" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: "#10B981" }}>Cost breakdown</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-4">
                        {[
                          { label: "Per week",      value: weekly },
                          { label: "Per fortnight", value: fortnightly! },
                          { label: "Per month",     value: monthly! },
                          { label: "Per year",      value: yearly! },
                        ].map((row) => (
                          <div key={row.label}>
                            <p className="text-[10px]" style={{ color: "#6B7280" }}>{row.label}</p>
                            <p className="text-sm font-bold tabular-nums text-white">{fmt(row.value)}</p>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2.5 text-xs" style={{ color: "rgba(52,211,153,0.7)" }}>
                        That's{" "}
                        <span className="font-bold" style={{ color: "#34D399" }}>{fmt(weekly)}/week</span>
                        {" "}·{" "}
                        <span className="font-bold" style={{ color: "#34D399" }}>{fmt(fortnightly!)}/fortnight</span>
                        {" "}·{" "}
                        <span className="font-bold" style={{ color: "#34D399" }}>{fmt(monthly!)}/month</span>
                        {" "}·{" "}
                        <span className="font-bold" style={{ color: "#34D399" }}>{fmt(yearly!)}/year</span>
                      </p>
                    </div>
                  )}

                  {!watchAmount || watchAmount <= 0 ? (
                    <p className="text-xs" style={{ color: "rgba(107,114,128,0.6)" }}>Enter an amount above to see the cost breakdown.</p>
                  ) : null}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-gold flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {isEdit ? "Update Transaction" : "Create Transaction"}
              </button>
              <Link href="/transactions">
                <button
                  type="button"
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
                  style={{ border: "1px solid rgba(16,185,129,0.25)", color: "#10B981", background: "transparent" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  Cancel
                </button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
