/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'var(--bg)',
          card: 'var(--pn)',
          border: 'var(--bd)',
          text: 'var(--tx)',
          muted: 'var(--mu)',
          accent: 'var(--ac)',
          blue: 'var(--bl)',
          red: 'var(--rd)',
          amber: 'var(--am)',
          save: 'var(--sv)',
          saveText: 'var(--svt)',
        },
        navy: { 900: '#0a192f', 800: '#112240', 700: '#233554' },
        teal: { 400: '#64ffda', 500: '#5eead4' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
