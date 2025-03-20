/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  prefix: "lem-",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--lem-border))",
        input: "hsl(var(--lem-input))",
        ring: "hsl(var(--lem-ring))",
        background: "hsl(var(--lem-background))",
        foreground: "hsl(var(--lem-foreground))",
        primary: {
          DEFAULT: "hsl(var(--lem-primary))",
          foreground: "hsl(var(--lem-primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--lem-secondary))",
          foreground: "hsl(var(--lem-secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--lem-destructive))",
          foreground: "hsl(var(--lem-destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--lem-muted))",
          foreground: "hsl(var(--lem-muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--lem-accent))",
          foreground: "hsl(var(--lem-accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--lem-popover))",
          foreground: "hsl(var(--lem-popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--lem-card))",
          foreground: "hsl(var(--lem-card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--lem-radius)",
        md: "calc(var(--lem-radius) - 2px)",
        sm: "calc(var(--lem-radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}