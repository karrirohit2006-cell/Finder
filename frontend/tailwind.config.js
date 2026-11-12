/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#e1e9f2',
          200: '#c3d3e6',
          300: '#95b3d4',
          400: '#618ebf',
          500: '#3d70a7',
          600: '#2d578b',
          700: '#254670',
          800: '#1e385a',
          900: '#0f172a',
          950: '#090d16',
        },
        lpu: {
          orange: '#ea580c',
          gold: '#f59e0b',
          accent: '#2563eb',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
