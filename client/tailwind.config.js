/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Based on your Staradmin screenshot theme
        'global-bg': 'var(--global-bg)',    
        'card-bg': 'var(--card-bg)',      
        'accent-lime': '#affc41',  // Your neon highlight color
        'border-soft': 'var(--border-soft)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
      },
      fontFamily: {
        // Fixes the font globally to a clean Sans-serif
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}