import { PrismaClient } from "@prisma/client";
import { subDays, subMonths, startOfWeek, endOfWeek } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.weeklyReview.deleteMany();

  const now = new Date();

  const transactions = [
    { type: "income", amount: 5500, category: "Salary", description: "Monthly salary", date: subDays(now, 2), financeMode: "personal", necessityLabel: "need" },
    { type: "income", amount: 5500, category: "Salary", description: "Monthly salary", date: subMonths(subDays(now, 2), 1), financeMode: "personal", necessityLabel: "need" },
    { type: "income", amount: 5500, category: "Salary", description: "Monthly salary", date: subMonths(subDays(now, 2), 2), financeMode: "personal", necessityLabel: "need" },
    { type: "income", amount: 800, category: "Freelance", description: "Design project", date: subDays(now, 10), financeMode: "personal", necessityLabel: "need" },
    { type: "income", amount: 250, category: "Investments", description: "Dividend payment", date: subDays(now, 15), financeMode: "personal", necessityLabel: "need" },
    { type: "income", amount: 3200, category: "Client Revenue", description: "Client A - monthly retainer", date: subDays(now, 3), financeMode: "business", necessityLabel: "need" },
    { type: "income", amount: 3200, category: "Client Revenue", description: "Client A - monthly retainer", date: subMonths(subDays(now, 3), 1), financeMode: "business", necessityLabel: "need" },
    { type: "income", amount: 1500, category: "Project Payment", description: "Website build - Client B", date: subDays(now, 8), financeMode: "business", necessityLabel: "need" },
    { type: "expense", amount: 1400, category: "Housing", subcategory: "Rent", description: "Monthly rent", date: subDays(now, 1), financeMode: "personal", necessityLabel: "need" },
    { type: "expense", amount: 1400, category: "Housing", subcategory: "Rent", description: "Monthly rent", date: subMonths(subDays(now, 1), 1), financeMode: "personal", necessityLabel: "need" },
    { type: "expense", amount: 1400, category: "Housing", subcategory: "Rent", description: "Monthly rent", date: subMonths(subDays(now, 1), 2), financeMode: "personal", necessityLabel: "need" },
    { type: "expense", amount: 85, category: "Utilities", subcategory: "Electricity", description: "Electric bill", date: subDays(now, 5), financeMode: "personal", necessityLabel: "need" },
    { type: "expense", amount: 65, category: "Utilities", subcategory: "Internet", description: "Internet bill", date: subDays(now, 5), financeMode: "personal", necessityLabel: "need" },
    { type: "expense", amount: 320, category: "Groceries", description: "Weekly groceries", date: subDays(now, 3), financeMode: "personal", necessityLabel: "need" },
    { type: "expense", amount: 290, category: "Groceries", description: "Weekly groceries", date: subDays(now, 10), financeMode: "personal", necessityLabel: "need" },
    { type: "expense", amount: 180, category: "Transport", subcategory: "Gas", description: "Gas + parking", date: subDays(now, 7), financeMode: "personal", necessityLabel: "need" },
    { type: "expense", amount: 95, category: "Health", subcategory: "Pharmacy", description: "Prescriptions", date: subDays(now, 12), financeMode: "personal", necessityLabel: "need" },
    { type: "expense", amount: 14.99, category: "Subscriptions", subcategory: "Netflix", description: "Netflix subscription", date: subDays(now, 4), financeMode: "personal", necessityLabel: "want" },
    { type: "expense", amount: 9.99, category: "Subscriptions", subcategory: "Spotify", description: "Spotify Premium", date: subDays(now, 4), financeMode: "personal", necessityLabel: "want" },
    { type: "expense", amount: 180, category: "Dining", subcategory: "Restaurants", description: "Dinner with friends", date: subDays(now, 6), financeMode: "personal", necessityLabel: "want" },
    { type: "expense", amount: 75, category: "Dining", subcategory: "Coffee", description: "Coffee shops", date: subDays(now, 9), financeMode: "personal", necessityLabel: "want" },
    { type: "expense", amount: 220, category: "Shopping", subcategory: "Clothing", description: "New clothes", date: subDays(now, 14), financeMode: "personal", necessityLabel: "want" },
    { type: "expense", amount: 60, category: "Entertainment", description: "Cinema + bowling", date: subDays(now, 11), financeMode: "personal", necessityLabel: "want" },
    { type: "expense", amount: 45, category: "Entertainment", description: "Video games DLC", date: subDays(now, 20), financeMode: "personal", necessityLabel: "want" },
    { type: "expense", amount: 120, category: "Dining", subcategory: "Fast Food", description: "Fast food + delivery apps", date: subDays(now, 8), financeMode: "personal", necessityLabel: "waste" },
    { type: "expense", amount: 85, category: "Shopping", subcategory: "Impulse", description: "Impulse Amazon purchases", date: subDays(now, 16), financeMode: "personal", necessityLabel: "waste" },
    { type: "expense", amount: 60, category: "Gambling", description: "Fantasy sports", date: subDays(now, 22), financeMode: "personal", necessityLabel: "waste" },
    { type: "expense", amount: 49, category: "Software", subcategory: "SaaS", description: "Figma subscription", date: subDays(now, 4), financeMode: "business", necessityLabel: "need" },
    { type: "expense", amount: 29, category: "Software", subcategory: "SaaS", description: "GitHub Pro", date: subDays(now, 4), financeMode: "business", necessityLabel: "need" },
    { type: "expense", amount: 199, category: "Marketing", description: "Ad spend - LinkedIn", date: subDays(now, 7), financeMode: "business", necessityLabel: "want" },
    { type: "expense", amount: 350, category: "Equipment", description: "External monitor", date: subDays(now, 25), financeMode: "business", necessityLabel: "need" },
    { type: "expense", amount: 85, category: "Office", subcategory: "Supplies", description: "Office supplies", date: subDays(now, 18), financeMode: "business", necessityLabel: "need" },
  ];

  for (const t of transactions) {
    await prisma.transaction.create({ data: t as any });
  }

  await prisma.savingsGoal.createMany({
    data: [
      {
        userId: "seed-user-id",
        title: "Emergency Fund",
        targetAmount: 15000,
        currentAmount: 8500,
        deadline: new Date(now.getFullYear(), now.getMonth() + 6, 1),
        priority: "high",
        notes: "6 months of living expenses. Critical priority.",
      },
      {
        userId: "seed-user-id",
        title: "Europe Trip",
        targetAmount: 5000,
        currentAmount: 2100,
        deadline: new Date(now.getFullYear() + 1, 5, 1),
        priority: "medium",
        notes: "2-week trip through Portugal, Spain, France.",
      },
      {
        userId: "seed-user-id",
        title: "New MacBook Pro",
        targetAmount: 3500,
        currentAmount: 3500,
        deadline: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        priority: "low",
        notes: "For business use. Already achieved!",
      },
      {
        userId: "seed-user-id",
        title: "Investment Portfolio",
        targetAmount: 50000,
        currentAmount: 12000,
        deadline: new Date(now.getFullYear() + 3, 0, 1),
        priority: "high",
        notes: "Long-term wealth building. ETF index funds.",
      },
    ],
  });

  const weekStart = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(subDays(now, 7), { weekStartsOn: 1 });

  await prisma.weeklyReview.create({
    data: {
      userId: "seed-user-id",
      weekStart,
      weekEnd,
      totalIncome: 5500,
      totalExpenses: 2480,
      totalSaved: 3020,
      wasteSpending: 265,
      notes: "Good week overall. Overspent on dining and fast food.",
      improvementPlan: "Cook at home more. Cancel unused subscriptions. Set a weekly dining budget of $100.",
    },
  });

  console.log("Seed data created successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
