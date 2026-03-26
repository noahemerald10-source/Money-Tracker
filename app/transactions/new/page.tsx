import { NewTransactionClient } from "@/components/transactions/new-transaction-client";

export default function NewTransactionPage() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "rgba(16,185,129,0.5)" }}>
          Transactions
        </p>
        <h1 className="text-2xl font-bold text-white tracking-tight">Add Transaction</h1>
        <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
          Pick a template or start from scratch
        </p>
      </div>
      <NewTransactionClient />
    </div>
  );
}
