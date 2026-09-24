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
        govNavy: "#123B63",
        darkNavy: "#0B253F",
        primaryBlue: "#1D5D91",
        govBg: "#F5F7FA",
        govCard: "#FFFFFF",
        govBorder: "#D9E0E7",
        textPrimary: "#17202A",
        textSecondary: "#5F6B76",
        statusGreen: "#16A34A",
        statusAmber: "#D97706",
        statusRed: "#DC2626",
        statusBlue: "#2563EB",
      },
    },
  },
  plugins: [],
};
export default config;
