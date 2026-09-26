/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#24324A', ink: '#182437', wine: '#9F263B', cloud: '#EEF1F7', line: '#C9D1DF'
      },
      fontFamily: { sans: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui'] },
      boxShadow: { panel: '0 14px 40px rgba(28, 40, 58, .09)' }
    }
  },
  plugins: []
}
