import { GoalForm } from "@/components/goals/goal-form";

export default function NewGoalPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">New Savings Goal</h1>
        <p className="text-muted-foreground mt-1">Define a savings target to work towards</p>
      </div>
      <GoalForm />
    </div>
  );
}
