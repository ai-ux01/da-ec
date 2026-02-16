import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFCFA",
          100: "#FAF8F4",
          200: "#F5F0E8",
          300: "#EDE6DB",
          400: "#E0D6C8",
        },
        earth: {
          100: "#D4C4B0",
          200: "#B8A088",
          300: "#9C7C60",
          400: "#7D6349",
          500: "#5C4A38",
          600: "#3D3228",
          700: "#2D241E",
          800: "#1E1814",
          900: "#14100D",
        },
        gold: {
          100: "#E8DFD0",
          200: "#D4C4A8",
          300: "#B8A078",
          400: "#9A8460",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(2.5rem, 6vw, 4.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.15" }],
        "display-md": ["clamp(1.5rem, 3vw, 2.25rem)", { lineHeight: "1.2" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body": ["1rem", { lineHeight: "1.6" }],
        "caption": ["0.875rem", { lineHeight: "1.5" }],
        "label": ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.02em" }],
      },
      borderRadius: {
        "card": "0.75rem",
        "button": "0.5rem",
      },
      boxShadow: {
        "soft": "0 2px 8px rgba(61, 50, 40, 0.06)",
        "card": "0 4px 20px rgba(61, 50, 40, 0.08)",
        "dropdown": "0 8px 24px rgba(61, 50, 40, 0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
