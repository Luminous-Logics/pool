import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        glass: {
          light: "rgba(255, 255, 255, 0.12)",
          card: "rgba(255, 255, 255, 0.08)",
          border: "rgba(255, 255, 255, 0.18)",
          highlight: "rgba(255, 255, 255, 0.3)",
          dark: "rgba(15, 23, 42, 0.75)",
        },
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "64px",
      },
      animation: {
        "liquid-slow": "liquidMorph 18s ease-in-out infinite",
        "liquid-fast": "liquidMorph 10s ease-in-out infinite alternate",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        liquidMorph: {
          "0%, 100%": {
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            transform: "translate(0px, 0px) scale(1) rotate(0deg)",
          },
          "34%": {
            borderRadius: "70% 30% 50% 50% / 30% 60% 40% 70%",
            transform: "translate(30px, -40px) scale(1.08) rotate(45deg)",
          },
          "67%": {
            borderRadius: "40% 60% 70% 30% / 40% 40% 60% 60%",
            transform: "translate(-25px, 25px) scale(0.95) rotate(-40deg)",
          },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.06)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.36)",
        "glass-inner": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)",
        "glass-glow": "0 0 25px rgba(120, 119, 198, 0.45)",
        "glass-hover": "0 12px 40px 0 rgba(0, 0, 0, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
