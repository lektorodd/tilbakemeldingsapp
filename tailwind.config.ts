import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Neutral palette (static, used for explicit color references)
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

        // Semantic backgrounds (CSS-variable-driven)
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',

        // Text colors
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-disabled': 'var(--color-text-disabled)',

        // Primary — Deep Teal (static palette for explicit use)
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

        // Brand (CSS-variable-driven for theme switching)
        brand: {
          DEFAULT: 'var(--color-brand)',
          hover: 'var(--color-brand-hover)',
          active: 'var(--color-brand-active)',
        },

        // Accent — Warm Coral
        accent: {
          900: '#8B3A3A',
          800: '#A34545',
          DEFAULT: 'var(--color-accent)',
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
          DEFAULT: 'var(--color-link)',
          hover: 'var(--color-link-hover)',
          visited: 'var(--color-link-visited)',
        },

        // Functional — Highlight
        highlight: {
          DEFAULT: 'var(--color-highlight)',
          bg: 'var(--color-highlight-bg)',
        },

        // Semantic colors
        success: {
          DEFAULT: 'var(--color-success)',
          bg: 'var(--color-success-bg)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          bg: 'var(--color-warning-bg)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          bg: 'var(--color-danger-bg)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          bg: 'var(--color-info-bg)',
        },

        focus: 'var(--color-focus)',
      },
      borderColor: {
        DEFAULT: 'var(--color-border)',
        border: 'var(--color-border)',
      },
      fontFamily: {
        sans: ['Inter', '"Source Sans Pro"', '"Source Sans 3"', 'system-ui', 'sans-serif'],
        display: ['"Roboto Slab"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
