import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

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
        "brand-orange": "#E9711E",
        "brand-teal": "#0A8A9D",
        "brand-navy": "#000080",
        "brand-white": "#FAFEFE",
        "brand-light-teal": "#00DCDC",
        "brand-rose-beige": "#C39585",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "Arial", "sans-serif"],
        display: ["var(--font-fredoka)", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [typography],
};
export default config;
