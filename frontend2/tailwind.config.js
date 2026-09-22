/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // EvalRight Brand Colors - EXACT from Logo
        brandRed: '#BD0A2E',      // EvalRight Red
        brandPurple: '#4B0082',    // EvalRight Purple
        brandBlue: '#4A90E2',      // EvalRight Blue (from "Screen before Hire")
        brand: {
          // Deep red from "E" in logo monogram (EXACT)
          red: {
            DEFAULT: '#BD0A2E',
            deep: '#BD0A2E',
            light: '#E63950',
            lighter: '#FF4D6D',
          },
          // Dark purple from "R" in logo monogram (EXACT)
          purple: {
            DEFAULT: '#4B0082',
            deep: '#3D0066',
            light: '#6A1B9A',
            lighter: '#8E24AA',
          },
          // Logo text red ("EVALRIGHT") - EXACT
          textRed: '#BD0A2E',
          // Subtitle color ("Screen before Hire") - EXACT blue from logo
          textBlue: '#4A90E2',
          // Gradient colors for buttons - EXACT brand colors only
          gradient: {
            from: '#BD0A2E', // Brand red
            to: '#4B0082',   // Brand purple
          }
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to right, #BD0A2E, #4B0082)',
        'brand-gradient-vertical': 'linear-gradient(to bottom, #BD0A2E, #4B0082)',
        'brand-gradient-text': 'linear-gradient(to right, #BD0A2E, #4B0082)',
      }
    },
  },
  plugins: [],
}

