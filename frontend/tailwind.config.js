/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Theme is driven by a `data-theme` attribute on <html>, not the
  // `dark:` variant, so every colour flows through a CSS variable.
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Colours are stored as "R G B" channel triplets so that Tailwind
        // opacity modifiers such as `cherry/15` and `soft-gray/50` keep
        // working: `rgb(var(--accent-cherry) / <alpha-value>)`.
        cherry: {
          DEFAULT: 'rgb(var(--accent-cherry) / <alpha-value>)',
          light: 'rgb(var(--accent-cherry-light) / <alpha-value>)',
          dark: 'rgb(var(--accent-cherry-dark) / <alpha-value>)',
        },
        wine: {
          DEFAULT: 'rgb(var(--accent-wine) / <alpha-value>)',
          light: 'rgb(var(--accent-wine-light) / <alpha-value>)',
          dark: 'rgb(var(--accent-wine-dark) / <alpha-value>)',
        },
        burgundy: 'rgb(var(--accent-burgundy) / <alpha-value>)',
        matte: {
          black: 'rgb(var(--bg-base) / <alpha-value>)',
          charcoal: 'rgb(var(--bg-elevated) / <alpha-value>)',
          card: 'rgb(var(--bg-raised) / <alpha-value>)',
        },
        soft: {
          white: 'rgb(var(--text-primary) / <alpha-value>)',
          gray: 'rgb(var(--text-secondary) / <alpha-value>)',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: 'var(--shadow-glass)',
        'cherry-glow': '0 0 20px rgb(var(--accent-cherry) / 0.15)',
        'cherry-glow-lg': '0 0 40px rgb(var(--accent-cherry) / 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
