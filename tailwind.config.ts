import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background:         "hsl(var(--background))",
        foreground:         "hsl(var(--foreground))",
        card:               "hsl(var(--card))",
        "card-foreground":  "hsl(var(--card-foreground))",
        popover:            "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary:            "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary:          "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted:              "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent:             "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive:        "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border:             "hsl(var(--border))",
        input:              "hsl(var(--input))",
        ring:               "hsl(var(--ring))",
        // Gold palette
        gold: {
          DEFAULT: "#10B981",
          light:   "#34D399",
          dark:    "#059669",
          50:  "#fefaec",
          100: "#fdf3c8",
          200: "#fae991",
          300: "#f7d954",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#8a6f09",
          800: "#5e4c09",
          900: "#3a300a",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      boxShadow: {
        card:       "0 8px 32px rgba(0,0,0,0.5)",
        "card-hover": "0 8px 32px rgba(16,185,129,0.08)",
        "gold-glow":  "0 0 20px rgba(16,185,129,0.15), 0 0 40px rgba(16,185,129,0.08)",
        "gold-sm":    "0 0 12px rgba(16,185,129,0.2)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #10B981, #34D399)",
        "gold-gradient-r": "linear-gradient(90deg, #10B981, #34D399)",
      },
    },
  },
  plugins: [],
};

export default config;
