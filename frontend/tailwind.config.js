/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
        },
        sidebar: {
          bg:     '#0f172a',
          text:   '#cbd5e1',
          active: '#2563eb',
        },
      },
    },
  },
  plugins: [],
}
