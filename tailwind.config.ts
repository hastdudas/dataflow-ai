import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#16202B',
          soft: '#3D4C5C',
          faint: '#6F7C89',
        },
        paper: {
          DEFAULT: '#F7F7F3',
          card: '#FFFFFF',
          rule: '#E1E1D8',
        },
        ledger: {
          DEFAULT: '#1F6F5C',
          deep: '#14503F',
          soft: '#E4EFE9',
          band: '#F0F5EF',
        },
        signal: '#C97A0A',
        alert: '#B3382F',
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          '"Hiragino Kaku Gothic ProN"',
          '"Noto Sans JP"',
          'Meiryo',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          '"Roboto Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      letterSpacing: {
        tightest: '-0.035em',
      },
      maxWidth: {
        page: '68rem',
      },
      keyframes: {
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'rise-in': 'rise-in .5s ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
