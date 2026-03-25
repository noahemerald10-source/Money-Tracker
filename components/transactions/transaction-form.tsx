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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  financeMode: z.enum(["personal", "business"]),
  necessityLabel: z.enum(["need", "want", "waste"]),
});

type FormData = z.infer<typeof schema>;

interface Props {
  transaction?: Transaction;
}

export function TransactionForm({ transaction }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
      type: (transaction?.type as "income" | "expense") || "expense",
      amount: transaction?.amount || undefined,
      category: transaction?.category || "",
      subcategory: transaction?.subcategory || "",
      description: transaction?.description || "",
      date: transaction?.date
        ? format(new Date(transaction.date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      financeMode: (transaction?.financeMode as "personal" | "business") || "personal",
      necessityLabel: (transaction?.necessityLabel as "need" | "want" | "waste") || "need",
    },
  });

  const watchType = watch("type");
  const categories = CATEGORIES[watchType as "income" | "expense"] || CATEGORIES.expense;

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const url = isEdit ? `/api/transactions/${transaction!.id}` : "/api/transactions";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      <Link href="/transactions">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2">
          <ArrowLeft size={16} />
          Back to Transactions
        </Button>
      </Link>

      <Card className="border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Type */}
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("amount")}
                />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
              </div>
            </div>

            {/* Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={watch("category")}
                  onValueChange={(v) => setValue("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
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

            {/* Finance Mode & Necessity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Finance Mode</Label>
                <Select
                  value={watch("financeMode")}
                  onValueChange={(v) => setValue("financeMode", v as "personal" | "business")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FINANCE_MODES.map((m) => (
                      <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Necessity Label</Label>
                <Select
                  value={watch("necessityLabel")}
                  onValueChange={(v) => setValue("necessityLabel", v as "need" | "want" | "waste")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NECESSITY_LABELS.map((l) => (
                      <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 size={16} className="mr-2 animate-spin" />}
                {isEdit ? "Update Transaction" : "Create Transaction"}
              </Button>
              <Link href="/transactions">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
