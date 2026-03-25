import { prisma } from "@/lib/prisma";
import { TransactionsClient } from "@/components/transactions/transactions-client";

async function getTransactions() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: "desc" },
  });
  return transactions.map((t) => ({
    ...t,
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));
}

export default async function TransactionsPage() {
  const transactions = await getTransactions();
  return <TransactionsClient initialTransactions={transactions} />;
}
