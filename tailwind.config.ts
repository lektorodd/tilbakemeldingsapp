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
        // Neutral palette (from brand guide)
        neutral: {
          900: '#1A1D23',
          800: '#2C3038',
          700: '#3E434E',
          600: '#555B68',
          500: '#6E7481',
          400: '#8B919D',
          300: '#A8ADB6',
          200: '#C5C8CF',
          100: '#E2E4E8',
          50: '#F5F6F8',
        },

        // Semantic backgrounds
        background: '#F5F6F8',
        surface: '#FFFFFF',
        'surface-alt': '#E2E4E8',

        // Text colors
        'text-primary': '#1A1D23',
        'text-secondary': '#555B68',
        'text-disabled': '#8B919D',

        // Primary — Deep Teal
        primary: {
          900: '#004D4D',
          800: '#006666',
          700: '#007F7F',
          600: '#008585',
          DEFAULT: '#008B8B',
          500: '#008B8B',
          400: '#1A9797',
          300: '#33A3A3',
          200: '#66BBBB',
          100: '#99D3D3',
          50: '#CCE9E9',
        },

        // Brand (alias for primary, backward compat)
        brand: {
          DEFAULT: '#008B8B',
          hover: '#007F7F',
          active: '#006666',
        },

        // Accent — Warm Coral
        accent: {
          900: '#8B3A3A',
          800: '#A34545',
          DEFAULT: '#D85A5A',
          700: '#C05050',
          600: '#D85A5A',
          500: '#D85A5A',
          400: '#DC6B6B',
          300: '#E07B7B',
          200: '#E89C9C',
          100: '#F0BDBD',
          50: '#F8DEDE',
        },

        // Functional — Links
        link: {
          DEFAULT: '#6B46C1',
          hover: '#553C9A',
          visited: '#9333EA',
        },

        // Functional — Highlight
        highlight: {
          DEFAULT: '#FBBF24',
          bg: '#FEF3C7',
        },

        // Semantic colors
        success: {
          DEFAULT: '#10B981',
          bg: '#D1FAE5',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#DC2626',
          bg: '#FEE2E2',
        },
        info: {
          DEFAULT: '#3B82F6',
          bg: '#DBEAFE',
        },

        focus: '#008B8B',
      },
      borderColor: {
        DEFAULT: '#C5C8CF',
        border: '#C5C8CF',
      },
      fontFamily: {
        sans: ['"Source Sans Pro"', '"Source Sans 3"', 'system-ui', 'sans-serif'],
        display: ['"Roboto Slab"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
