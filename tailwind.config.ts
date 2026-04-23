import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#11243B",
        sky: "#5BC0EB",
        sand: "#F4EBD0",
        coral: "#FF7F50",
        mint: "#8BD3C7"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(17, 36, 59, 0.18)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(17, 36, 59, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(17, 36, 59, 0.08) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
