"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  ClipboardList,
  BarChart3,
  Sparkles,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { href: "/transactions",  label: "Transactions",   icon: ArrowLeftRight },
  { href: "/goals",         label: "Goals",          icon: Target },
  { href: "/weekly-review", label: "Weekly Review",  icon: ClipboardList },
  { href: "/analytics",     label: "Analytics",      icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  const noSidebar = pathname === "/" || pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  if (noSidebar) return null;

  return (
    <aside
      className="flex h-screen w-60 flex-col"
      style={{
        background: "#050505",
        borderRight: "1px solid rgba(16,185,129,0.1)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "1px solid rgba(16,185,129,0.08)" }}
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl shadow-gold-sm"
          style={{ background: "linear-gradient(135deg, #10B981, #34D399)" }}
        >
          <Sparkles className="h-4 w-4 text-black" />
        </div>
        <div>
          <span className="text-sm font-bold tracking-tight" style={{ color: "#34D399" }}>
            MoneyTrack
          </span>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(16,185,129,0.4)" }}>
            Private Finance
          </p>
        </div>
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
                  ? {
                      background: "rgba(16,185,129,0.08)",
                      color: "#34D399",
                    }
                  : {
                      color: "#6B7280",
                    }
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
              {/* Gold left border for active item */}
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
  );
}
