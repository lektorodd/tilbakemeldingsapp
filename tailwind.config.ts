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
        // Matte neutral palette
        background: '#FAFAFA',
        surface: '#FFFFFF',
        'surface-alt': '#F4F4F5',

        // Text colors
        'text-primary': '#1A1A1A',
        'text-secondary': '#4B5563',
        'text-disabled': '#9CA3AF',

        // Brand (educational blue)
        brand: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          active: '#1E40AF',
        },

        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        focus: '#3B82F6',
      },
      borderColor: {
        DEFAULT: '#E5E7EB',
        border: '#E5E7EB',
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
