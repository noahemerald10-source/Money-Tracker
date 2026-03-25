export interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  subcategory?: string | null;
  description?: string | null;
  date: Date | string;
  financeMode: string;
  necessityLabel: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date | string | null;
  priority: string;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface WeeklyReview {
  id: string;
  weekStart: Date | string;
  weekEnd: Date | string;
  totalIncome: number;
  totalExpenses: number;
  totalSaved: number;
  wasteSpending: number;
  notes?: string | null;
  improvementPlan?: string | null;
  createdAt: Date | string;
}
