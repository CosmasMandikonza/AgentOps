import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        border: "var(--border)",
        accent: "var(--accent)",
        danger: "var(--danger)",
        warning: "var(--warning)",
        muted: "var(--muted)",
        text: "var(--text)",
      },
      boxShadow: {
        glow: "0 0 24px var(--accent-glow)",
      },
    },
  },
  plugins: [],
};

export default config;
