import { SignUp } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

export default function SignUpPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center bg-[#080808]"
      style={{
        backgroundImage: "radial-gradient(rgba(16,185,129,0.025) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="flex flex-col items-center gap-8 py-12">
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: "linear-gradient(135deg, #10B981, #34D399)" }}
          >
            <Sparkles className="h-6 w-6 text-black" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: "#34D399" }}>MoneyTrack</p>
            <p className="text-xs uppercase tracking-widest mt-0.5" style={{ color: "rgba(16,185,129,0.4)" }}>
              Private Finance
            </p>
          </div>
        </div>

        <SignUp
          fallbackRedirectUrl="/dashboard"
          signInUrl="/sign-in"
          appearance={{
            variables: {
              colorPrimary: "#10B981",
              colorBackground: "#0f0f0f",
              colorText: "#ffffff",
              colorTextSecondary: "#9CA3AF",
              colorInputBackground: "#1a1a1a",
              colorInputText: "#ffffff",
              borderRadius: "0.75rem",
            },
            elements: {
              card: {
                background: "#0f0f0f",
                border: "1px solid rgba(16,185,129,0.15)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              },
              headerTitle: { color: "#ffffff" },
              headerSubtitle: { color: "#9CA3AF" },
              socialButtonsBlockButton: {
                background: "#1a1a1a",
                border: "1px solid rgba(16,185,129,0.15)",
                color: "#ffffff",
              },
              dividerLine: { background: "rgba(16,185,129,0.1)" },
              dividerText: { color: "#6B7280" },
              formFieldLabel: { color: "#9CA3AF" },
              formFieldInput: {
                background: "#1a1a1a",
                border: "1px solid rgba(16,185,129,0.15)",
                color: "#ffffff",
              },
              formButtonPrimary: {
                background: "linear-gradient(135deg, #10B981, #34D399)",
                color: "#000000",
                fontWeight: "700",
              },
              footerActionLink: { color: "#10B981" },
            },
          }}
        />
      </div>
    </main>
  );
}
