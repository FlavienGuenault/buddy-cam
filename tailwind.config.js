/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // on garde le nom "candy" pour éviter de réécrire toutes les classes,
        // mais la palette passe en bordeaux.
        candy: {
          50:'#fff1f3',100:'#fde2e7',200:'#fac0cd',300:'#f28aa3',
          400:'#e75c7d',500:'#b01535',600:'#980f2b',700:'#7d0c23',
          800:'#64091c',900:'#4e0716'
        },
        pirate: '#0f172a'
      },
      boxShadow: {
        candy: '0 10px 20px rgba(176,21,53,.22), 0 6px 6px rgba(231,92,125,.18)'
      },
      animation: {
        spinSlow: 'spin 4s linear infinite',
        bounceSoft: 'bounceSoft .8s both',
        float: 'float 3s ease-in-out infinite'
      },
      keyframes: {
        bounceSoft: {
          '0%,100%': { transform: 'translateY(0) scale(1)' },
          '30%': { transform: 'translateY(-6px) scale(1.03)' },
          '60%': { transform: 'translateY(0) scale(.98)' }
        },
        float: { '0%,100%': { transform: 'translateY(-3px)' }, '50%': { transform: 'translateY(3px)' } }
      }
    }
  },
  plugins: []
}
