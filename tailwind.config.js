/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        candy: { 50:'#fff1f5',100:'#ffe4ec',200:'#ffc9da',300:'#ff99bb',400:'#ff6fa1',
                 500:'#ff4f8a',600:'#e23d79',700:'#c02f66',800:'#9f2555',900:'#7f1d46' },
        camellia: '#e11d48',
        pirate: '#0f172a'
      },
      boxShadow: {
        candy: '0 10px 20px rgba(255,79,138,.25), 0 6px 6px rgba(255,111,161,.2)'
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