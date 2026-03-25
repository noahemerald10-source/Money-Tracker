import { TransactionForm } from "@/components/transactions/transaction-form";

export default function NewTransactionPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Add Transaction</h1>
        <p className="text-muted-foreground mt-1">Record a new income or expense</p>
      </div>
      <TransactionForm />
    </div>
  );
}
