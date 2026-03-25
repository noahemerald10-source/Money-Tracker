import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { GoalForm } from "@/components/goals/goal-form";

interface Props {
  params: { id: string };
}

async function getGoal(id: string) {
  const g = await prisma.savingsGoal.findUnique({ where: { id } });
  if (!g) return null;
  return {
    ...g,
    deadline: g.deadline?.toISOString() ?? null,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
  };
}

export default async function EditGoalPage({ params }: Props) {
  const goal = await getGoal(params.id);
  if (!goal) notFound();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Edit Goal</h1>
        <p className="text-muted-foreground mt-1">Update your savings goal</p>
      </div>
      <GoalForm goal={goal} />
    </div>
  );
}
