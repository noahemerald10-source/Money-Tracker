import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function calcSavingsRate(income: number, expenses: number): number {
  if (income === 0) return 0;
  const saved = income - expenses;
  return Math.max(0, Math.round((saved / income) * 100));
}

export const CATEGORIES = {
  income: ["Salary", "Freelance", "Investments", "Client Revenue", "Project Payment", "Bonus", "Other Income"],
  expense: ["Housing", "Utilities", "Groceries", "Transport", "Health", "Subscriptions", "Dining", "Shopping", "Entertainment", "Software", "Marketing", "Equipment", "Office", "Gambling", "Other"],
};

export const NECESSITY_LABELS = ["need", "want", "waste"] as const;
export const FINANCE_MODES = ["personal", "business"] as const;
export const TRANSACTION_TYPES = ["income", "expense"] as const;
export const PRIORITIES = ["low", "medium", "high"] as const;
