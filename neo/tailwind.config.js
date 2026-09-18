/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: 'var(--neo-bg)',
          elevated: 'var(--neo-elevated)',
          surface: 'var(--neo-surface)',
          input: 'var(--neo-input)',
          border: 'var(--neo-border)',
          text: 'var(--neo-text)',
          muted: 'var(--neo-muted)',
          faint: 'var(--neo-faint)',
          accent: 'var(--neo-accent)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        pill: '0 0 0 1px rgba(255,255,255,0.04), 0 8px 30px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
