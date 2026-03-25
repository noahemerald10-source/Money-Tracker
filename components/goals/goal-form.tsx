"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { SavingsGoal } from "@/types";
import { PRIORITIES } from "@/lib/utils";
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
  title: z.string().min(1, "Title is required"),
  targetAmount: z.coerce.number().positive("Target must be positive"),
  currentAmount: z.coerce.number().min(0, "Cannot be negative"),
  deadline: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  goal?: SavingsGoal;
}

export function GoalForm({ goal }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!goal;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: goal?.title || "",
      targetAmount: goal?.targetAmount || undefined,
      currentAmount: goal?.currentAmount || 0,
      deadline: goal?.deadline ? format(new Date(goal.deadline), "yyyy-MM-dd") : "",
      priority: (goal?.priority as "low" | "medium" | "high") || "medium",
      notes: goal?.notes || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const url = isEdit ? `/api/goals/${goal!.id}` : "/api/goals";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          deadline: data.deadline || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      toast({ title: isEdit ? "Goal updated" : "Goal created" });
      router.push("/goals");
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
      <Link href="/goals">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2">
          <ArrowLeft size={16} />
          Back to Goals
        </Button>
      </Link>

      <Card className="border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title</Label>
              <Input id="title" placeholder="e.g. Emergency Fund, Europe Trip..." {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount ($)</Label>
                <Input id="targetAmount" type="number" step="0.01" placeholder="10000" {...register("targetAmount")} />
                {errors.targetAmount && <p className="text-xs text-destructive">{errors.targetAmount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentAmount">Current Amount ($)</Label>
                <Input id="currentAmount" type="number" step="0.01" placeholder="0" {...register("currentAmount")} />
                {errors.currentAmount && <p className="text-xs text-destructive">{errors.currentAmount.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (optional)</Label>
                <Input id="deadline" type="date" {...register("deadline")} />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={watch("priority")}
                  onValueChange={(v) => setValue("priority", v as "low" | "medium" | "high")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" placeholder="Why is this goal important? Any specific plan?" rows={3} {...register("notes")} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 size={16} className="mr-2 animate-spin" />}
                {isEdit ? "Update Goal" : "Create Goal"}
              </Button>
              <Link href="/goals">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
