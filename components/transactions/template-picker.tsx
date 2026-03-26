"use client";

import { useState, useMemo } from "react";
import { TEMPLATE_GROUPS, ALL_TEMPLATES, NECESSITY_DISPLAY, TransactionTemplate } from "@/lib/transaction-templates";
import { Check, Search, Zap, ArrowRight } from "lucide-react";

interface Props {
  onSelect: (template: TransactionTemplate) => void;
  onSkip: () => void;
}

const FREQ_LABELS: Record<string, string> = {
  weekly: "Weekly", fortnightly: "Fortnightly", monthly: "Monthly",
  quarterly: "Quarterly", yearly: "Yearly",
};

export function TemplatePicker({ onSelect, onSkip }: Props) {
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = activeGroup === "all"
      ? ALL_TEMPLATES
      : (TEMPLATE_GROUPS.find((g) => g.id === activeGroup)?.templates ?? []);
    if (!q) return base;
    return base.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.subcategory?.toLowerCase().includes(q) ?? false)
    );
  }, [activeGroup, search]);

  const selectedTemplate = selected ? ALL_TEMPLATES.find((t) => t.id === selected) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "rgba(16,185,129,0.12)" }}
            >
              <Zap size={14} style={{ color: "#10B981" }} />
            </div>
            <h2 className="text-lg font-bold text-white">Quick Add from Template</h2>
          </div>
          <p className="text-sm ml-9" style={{ color: "#6B7280" }}>
            Pick a template to pre-fill your transaction, then adjust as needed.
          </p>
        </div>
        <button
          onClick={onSkip}
          className="flex-shrink-0 text-xs font-semibold rounded-lg px-3 py-2 transition-all"
          style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#6B7280", background: "transparent" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,185,129,0.3)";
            (e.currentTarget as HTMLElement).style.color = "#10B981";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLElement).style.color = "#6B7280";
          }}
        >
          Start from scratch →
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#6B7280" }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates…"
          className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all"
          style={{
            background: "#0a0a0a",
            border: "1px solid rgba(16,185,129,0.15)",
          }}
          onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,185,129,0.4)"; }}
          onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,185,129,0.15)"; }}
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <CategoryTab
          label="All"
          active={activeGroup === "all"}
          onClick={() => setActiveGroup("all")}
        />
        {TEMPLATE_GROUPS.map((g) => (
          <CategoryTab
            key={g.id}
            label={g.label}
            active={activeGroup === g.id}
            onClick={() => setActiveGroup(g.id)}
          />
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {filtered.map((template) => {
          const isSelected = selected === template.id;
          const necessity = NECESSITY_DISPLAY[template.necessityLabel];
          return (
            <button
              key={template.id}
              onClick={() => setSelected(isSelected ? null : template.id)}
              className="text-left rounded-xl p-3.5 transition-all duration-150"
              style={{
                background: isSelected ? "rgba(16,185,129,0.08)" : "#0a0a0a",
                border: isSelected
                  ? "1px solid rgba(16,185,129,0.5)"
                  : "1px solid rgba(16,185,129,0.12)",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,185,129,0.35)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,185,129,0.12)";
                  (e.currentTarget as HTMLElement).style.background = "#0a0a0a";
                }
              }}
            >
              <div className="flex items-start justify-between gap-1 mb-2">
                <span className="text-xl leading-none">{template.emoji}</span>
                {isSelected && (
                  <div
                    className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: "#10B981" }}
                  >
                    <Check size={9} color="black" strokeWidth={3} />
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-white leading-tight mb-1.5">{template.name}</p>
              <div className="flex flex-wrap gap-1">
                {template.frequency && (
                  <span
                    className="text-[10px] font-medium rounded-md px-1.5 py-0.5"
                    style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}
                  >
                    {FREQ_LABELS[template.frequency]}
                  </span>
                )}
                <span
                  className="text-[10px] font-medium rounded-md px-1.5 py-0.5"
                  style={{ background: necessity.bg, color: necessity.color }}
                >
                  {necessity.label}
                </span>
              </div>
              <p className="text-[10px] mt-2 leading-tight" style={{ color: "#4B5563" }}>
                {template.amountHint}
              </p>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 py-10 text-center">
            <p className="text-sm" style={{ color: "#6B7280" }}>No templates match "{search}"</p>
          </div>
        )}
      </div>

      {/* Confirm CTA */}
      <div
        className="sticky bottom-0 pt-4 pb-1"
        style={{ background: "linear-gradient(to top, #080808 70%, transparent)" }}
      >
        {selectedTemplate ? (
          <div className="flex items-center gap-3">
            <div
              className="flex-1 flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <span className="text-xl">{selectedTemplate.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{selectedTemplate.name}</p>
                <p className="text-xs" style={{ color: "#6B7280" }}>
                  {selectedTemplate.category}
                  {selectedTemplate.frequency ? ` · ${FREQ_LABELS[selectedTemplate.frequency]}` : ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => onSelect(selectedTemplate)}
              className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all"
              style={{ background: "linear-gradient(135deg,#10B981,#34D399)", color: "#000" }}
            >
              Use template
              <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={onSkip}
            className="w-full rounded-xl py-3 text-sm font-semibold transition-all"
            style={{ border: "1px solid rgba(16,185,129,0.2)", color: "#6B7280", background: "transparent" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#10B981";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,185,129,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#6B7280";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,185,129,0.2)";
            }}
          >
            Skip — Start from scratch
          </button>
        )}
      </div>
    </div>
  );
}

function CategoryTab({
  label, active, onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 whitespace-nowrap"
      style={
        active
          ? { background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.4)" }
          : { background: "rgba(255,255,255,0.03)", color: "#6B7280", border: "1px solid rgba(255,255,255,0.07)" }
      }
    >
      {label}
    </button>
  );
}
