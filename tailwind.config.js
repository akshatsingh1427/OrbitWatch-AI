/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        space: {
          bg: "#05070d",
          surface: "#0a0e17",
          panel: "#0d1320",
          border: "#1a2436",
          hover: "#16213a",
        },
        accent: {
          blue: "#3b82f6",
          cyan: "#22d3ee",
          glow: "#60a5fa",
        },
        status: {
          nominal: "#22c55e",
          warning: "#f59e0b",
          critical: "#ef4444",
          info: "#3b82f6",
          standby: "#64748b",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', '"Space Mono"', "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "drift": "drift 120s linear infinite",
        "scan": "scan 4s ease-in-out infinite",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translateY(0px)" },
          "100%": { transform: "translateY(-40px)" },
        },
        scan: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
