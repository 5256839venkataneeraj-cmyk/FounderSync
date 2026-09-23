import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nocturne: {
          canvas: '#0F0F14',
          surface: '#131318',
          'surface-dim': '#131318',
          'surface-bright': '#39393e',
          card: '#1A1A22',
          well: '#14141C',
          'container-low': '#1B1B20',
          'container': '#1F1F24',
          'container-high': '#2A292F',
          'container-highest': '#35343A',
          primary: '#6366F1',
          'primary-light': '#8083FF',
          secondary: '#A855F7',
          'secondary-light': '#DDB7FF',
          tertiary: '#F59E0B',
          'tertiary-light': '#FFB95F',
          border: 'rgba(255, 255, 255, 0.10)',
          'border-focus': 'rgba(255, 255, 255, 0.18)',
          'text-primary': '#F1F1F5',
          'text-secondary': '#9CA3AF',
          'text-muted': '#6B7280',
        },
      },
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
