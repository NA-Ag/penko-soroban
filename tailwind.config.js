/** @type {import('tailwindcss').Config} */

// Colours come from CSS variables in index.css, so light (washi paper and sumi ink) and
// dark (black lacquer and gold) themes swap in one place
const token = name => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './*.{ts,tsx}', './components/**/*.{ts,tsx}', './views/**/*.{ts,tsx}', './core/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: token('paper'),
        surface: token('surface'),
        sunken: token('sunken'),
        ink: token('ink'),
        muted: token('muted'),
        line: token('line'),
        shu: token('shu'),
        'shu-ink': token('shu-ink'),
        gold: token('gold'),
        wood: token('wood'),
        'wood-dark': token('wood-dark'),
        bead: token('bead'),
        'bead-light': token('bead-light'),
        ok: token('ok'),
      },
      fontFamily: {
        // Nunito: soft and rounded, for headings and text alike
        sans: ['"Nunito Variable"', 'Nunito', 'ui-rounded', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Nunito Variable"', 'Nunito', 'ui-rounded', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Kanji on seals: the device's brush-like Mincho, for the hanko look
        seal: ['"Hiragino Mincho ProN"', '"Yu Mincho"', '"Noto Serif CJK JP"', '"Noto Serif JP"', '"Source Han Serif"', 'serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgb(var(--line) / 0.6), 0 8px 24px -12px rgb(var(--shadow) / 0.35)',
      },
    },
  },
  plugins: [],
};
