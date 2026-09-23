import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Apple San Francisco font family stack (SF Pro / system-ui)
        sans: [
          'var(--font-sf)',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"SF Pro"',
          'system-ui',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        // Basic / Bricolage Grotesque Display font family stack
        display: [
          'var(--font-grotesk)',
          '"Bricolage Grotesque"',
          '"Space Grotesk"',
          'system-ui',
          'sans-serif',
        ],
        grotesk: [
          'var(--font-grotesk)',
          '"Bricolage Grotesque"',
          '"Space Grotesk"',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.12)',
        'glow-indigo': '0 0 24px -4px rgba(79, 70, 229, 0.25)',
        'glow-amber': '0 0 24px -4px rgba(245, 158, 11, 0.25)',
      },
    },
  },
  plugins: [],
};
export default config;
