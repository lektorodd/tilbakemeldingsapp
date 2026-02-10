import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Modern neutral palette (slate-tinted)
        background: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-alt': '#F1F5F9',

        // Text colors (deeper, richer)
        'text-primary': '#0F172A',
        'text-secondary': '#475569',
        'text-disabled': '#94A3B8',

        // Brand (indigo)
        brand: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          active: '#3730A3',
        },

        // Semantic colors (refined)
        success: '#059669',
        warning: '#D97706',
        danger: '#DC2626',
        focus: '#6366F1',
      },
      borderColor: {
        DEFAULT: '#E2E8F0',
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Satoshi', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
