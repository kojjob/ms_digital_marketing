/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../*.html",
    "../**/*.html",
    "../js/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        dark: '#111827',
        light: '#f9fafb',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        display: ['Montserrat', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out forwards',
        'slide-up': 'slideUp 0.5s ease-in-out forwards',
        'slide-right': 'slideRight 0.5s ease-in-out forwards',
        'scale-in': 'scaleIn 0.5s ease-in-out forwards',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.06)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    }
  },
  plugins: [],
}
