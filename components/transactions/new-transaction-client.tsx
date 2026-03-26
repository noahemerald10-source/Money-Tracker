"use client";

import { useState } from "react";
import { TransactionTemplate } from "@/lib/transaction-templates";
import { TemplatePicker } from "./template-picker";
import { TransactionForm } from "./transaction-form";

type Step = "template" | "form";

export function NewTransactionClient() {
  const [step, setStep] = useState<Step>("template");
  const [prefill, setPrefill] = useState<TransactionTemplate | null>(null);

  const handleSelect = (template: TransactionTemplate) => {
    setPrefill(template);
    setStep("form");
  };

  const handleSkip = () => {
    setPrefill(null);
    setStep("form");
  };

  if (step === "template") {
    return (
      <div
        className="rounded-2xl p-6 shadow-card"
        style={{ background: "#0a0a0a", border: "1px solid rgba(16,185,129,0.15)" }}
      >
        <TemplatePicker onSelect={handleSelect} onSkip={handleSkip} />
      </div>
    );
  }

  return (
    <TransactionForm
      prefill={prefill ?? undefined}
      onBackToTemplates={() => {
        setPrefill(null);
        setStep("template");
      }}
    />
  );
}
