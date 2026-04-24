/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          glow: 'var(--primary-glow)',
        },
        secondary: {
          DEFAULT: '#8b5cf6', // Keeping secondary as a constant accent
          glow: '#a78bfa',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          glow: 'var(--primary-glow)',
        },
        dark: {
          DEFAULT: '#020617', // Obsidian
          soft: '#0f172a',
          lighter: '#1e293b',
        }
      },
      animation: {
        'glow-slow': 'glow 3s ease-in-out infinite alternate',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(var(--primary-rgb), 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(var(--primary-rgb), 1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
    },
  },
  plugins: [
    plugin(function({ addComponents, theme }) {
      addComponents({
        '.glass-panel': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          borderWidth: '1px',
          borderColor: 'rgba(var(--primary-rgb), 0.1)',
          borderRadius: theme('borderRadius.2xl'),
        },
        '.neon-border': {
          borderWidth: '1px',
          borderColor: 'rgba(var(--primary-rgb), 0.3)',
          boxShadow: '0 0 15px rgba(var(--primary-rgb), 0.3)',
        },
        '.btn-primary': {
          paddingLeft: theme('spacing.6'),
          paddingRight: theme('spacing.6'),
          paddingTop: theme('spacing.3'),
          paddingBottom: theme('spacing.3'),
          backgroundColor: 'var(--primary)',
          color: theme('colors.white'),
          borderRadius: theme('borderRadius.xl'),
          fontWeight: theme('fontWeight.semibold'),
          transitionProperty: 'all',
          transitionDuration: '300ms',
          '&:hover': {
            backgroundColor: 'var(--primary-glow)',
            boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.6)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
      })
    })
  ],
}
