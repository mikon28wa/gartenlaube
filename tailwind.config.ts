import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: "#C85A3A",
          light: "#E8745C",
          dark: "#A63D1F",
        },
        ochre: {
          DEFAULT: "#B8860B",
          light: "#DAA520",
          dark: "#8B6914",
        },
        sage: {
          DEFAULT: "#6B8E7F",
          light: "#8BA89D",
          dark: "#4A6B5D",
        },
        cream: {
          DEFAULT: "#F5F1E8",
          dark: "#E8DFD3",
          darker: "#D4C4B0",
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        serif: ["Lora", "serif"],
      },
      fontSize: {
        hero: ["3.5rem", { lineHeight: "1.2", fontWeight: "800" }],
        "hero-md": ["4.5rem", { lineHeight: "1.2", fontWeight: "800" }],
        "hero-lg": ["5.5rem", { lineHeight: "1.2", fontWeight: "800" }],
      },
      borderRadius: {
        organic: "45% 55% 52% 48% / 48% 45% 55% 52%",
        "organic-2": "40% 60% 65% 35% / 35% 40% 60% 65%",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in-down": "fadeInDown 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.6s ease-out",
        "slide-in-right": "slideInRight 0.6s ease-out",
        "pulse-soft": "pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
