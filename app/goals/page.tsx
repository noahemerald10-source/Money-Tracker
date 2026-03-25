import { prisma } from "@/lib/prisma";
import { GoalsClient } from "@/components/goals/goals-client";

async function getGoals() {
  const goals = await prisma.savingsGoal.findMany({
    orderBy: { createdAt: "desc" },
  });
  return goals.map((g) => ({
    ...g,
    deadline: g.deadline?.toISOString() ?? null,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
  }));
}

export default async function GoalsPage() {
  const goals = await getGoals();
  return <GoalsClient initialGoals={goals} />;
}
