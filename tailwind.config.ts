import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0C0A07',
        },
        gold: {
          DEFAULT: '#C9A84C',
          muted: '#7a6430',
        },
        bone: {
          DEFAULT: '#F2EDE4',
        },
        muted: {
          DEFAULT: '#6b6457',
        },
        border: {
          DEFAULT: '#2a261e',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
