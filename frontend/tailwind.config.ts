import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8ff",
          100: "#d9efff",
          500: "#118ab2",
          600: "#0e7490",
          700: "#0b5f75"
        },
        accent: "#ef476f"
      }
    }
  },
  plugins: []
} satisfies Config;
