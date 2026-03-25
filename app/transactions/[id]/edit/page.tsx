import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TransactionForm } from "@/components/transactions/transaction-form";

interface Props {
  params: { id: string };
}

async function getTransaction(id: string) {
  const t = await prisma.transaction.findUnique({ where: { id } });
  if (!t) return null;
  return {
    ...t,
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export default async function EditTransactionPage({ params }: Props) {
  const transaction = await getTransaction(params.id);
  if (!transaction) notFound();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Edit Transaction</h1>
        <p className="text-muted-foreground mt-1">Update transaction details</p>
      </div>
      <TransactionForm transaction={transaction} />
    </div>
  );
}
