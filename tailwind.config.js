/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void:    '#0a0710',
        abyss:   '#100c1a',
        deep:    '#160f24',
        cavern:  '#1e1530',
        shadow:  '#2a1d42',
        dusk:    '#3d2b63',
        brand:   '#5c3d8f',
        violet:  '#7b52c1',
        lavender:'#a07ee0',
        mist:    '#c8b4f0',
        ghost:   '#e8deff',
        spark:   '#b46ef5',
        flare:   '#d4a4ff',
        ember:   '#ff6b35',
        ash:     '#8b8099',
        slate:   '#4a4260',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
