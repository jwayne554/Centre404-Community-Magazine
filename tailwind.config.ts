import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Centre404 exact colors from HTML
        'centre-primary': '#2c5aa0',
        'centre-secondary': '#f39c12',
        'centre-success': '#27ae60',
        'centre-danger': '#e74c3c',
        'centre-text': '#2c3e50',
        'centre-border': '#dddddd',
        'centre-bg-light': '#f8f9fa',
        'centre-bg-hover': '#e3f2fd',
      },
    },
  },
  plugins: [],
};

export default config;