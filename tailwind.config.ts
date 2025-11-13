import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // New Design System Colors (Green Theme)
        primary: '#34A853',      // Google green (was blue #2c5aa0)
        accent: '#FFBB00',       // Yellow/gold
        background: '#F8F9FA',   // Light gray
        charcoal: '#333333',     // Dark text
        'light-gray': '#E5E7EB', // Border/divider
        'dark-gray': '#6B7280',  // Secondary text

        // Legacy Centre404 colors (for gradual migration)
        'centre-primary': '#2c5aa0',
        'centre-secondary': '#f39c12',
        'centre-success': '#27ae60',
        'centre-danger': '#e74c3c',
        'centre-text': '#2c3e50',
        'centre-border': '#dddddd',
        'centre-bg-light': '#f8f9fa',
        'centre-bg-hover': '#e3f2fd',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
};

export default config;