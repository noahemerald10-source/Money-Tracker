"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  ClipboardList,
  BarChart3,
  PiggyBank,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",     label: "Dashboard",    shortLabel: "Home",      icon: LayoutDashboard },
  { href: "/transactions",  label: "Transactions",  shortLabel: "Txns",     icon: ArrowLeftRight },
  { href: "/goals",         label: "Goals",         shortLabel: "Goals",    icon: Target },
  { href: "/weekly-review", label: "Weekly Review", shortLabel: "Review",   icon: ClipboardList },
  { href: "/analytics",     label: "Analytics",     shortLabel: "Stats",    icon: BarChart3 },
  { href: "/savings",       label: "Savings Calc",  shortLabel: "Calc",     icon: PiggyBank },
];

export function Sidebar() {
  const pathname = usePathname();

  const noSidebar = pathname === "/" || pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  if (noSidebar) return null;

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex h-screen w-60 flex-col"
        style={{
          background: "#050505",
          borderRight: "1px solid rgba(16,185,129,0.1)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid rgba(16,185,129,0.08)" }}
        >
          <Image
            src="/logo.png"
            alt="MoneyTrack"
            width={140}
            height={40}
            className="object-contain"
            priority
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          <p
            className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "rgba(16,185,129,0.3)" }}
          >
            Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200"
                )}
                style={
                  isActive
                    ? { background: "rgba(16,185,129,0.08)", color: "#34D399" }
                    : { color: "#6B7280" }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.05)";
                    (e.currentTarget as HTMLElement).style.color = "#ffffff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#6B7280";
                  }
                }}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 rounded-full"
                    style={{ width: "3px", background: "linear-gradient(180deg, #10B981, #34D399)" }}
                  />
                )}
                <Icon
                  className="h-4 w-4 shrink-0 transition-colors"
                  style={{ color: isActive ? "#34D399" : undefined }}
                />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <div
          className="px-3 py-4"
          style={{ borderTop: "1px solid rgba(16,185,129,0.08)" }}
        >
          <button
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200"
            style={{ color: "#6B7280" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.05)";
              (e.currentTarget as HTMLElement).style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#6B7280";
            }}
          >
            <Settings className="h-4 w-4 shrink-0 transition-colors" />
            Settings
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around px-2 pt-2"
        style={{
          background: "#050505",
          borderTop: "1px solid rgba(16,185,129,0.1)",
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 min-w-[44px] rounded-xl px-3 py-1.5 transition-all duration-200"
              style={isActive ? { color: "#34D399" } : { color: "#52525b" }}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-[9px] font-medium tracking-wide">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
