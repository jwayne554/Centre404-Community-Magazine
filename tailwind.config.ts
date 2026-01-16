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
      // P4-2: Type Scale Definition
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
        'heading': ['1.5rem', { lineHeight: '1.25', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      borderRadius: {
        xl: '12px',
      },
      // P4-3: Consistent Shadow Scale
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px rgba(0, 0, 0, 0.07)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'modal': '0 25px 50px rgba(0, 0, 0, 0.25)',
      },
      // P4-6: Consistent Spacing Scale (documentation)
      // xs: 4px (p-1), sm: 8px (p-2), md: 16px (p-4), lg: 24px (p-6), xl: 32px (p-8)
      spacing: {
        'xs': '4px',   // p-1 equivalent
        'sm': '8px',   // p-2 equivalent
        'md': '16px',  // p-4 equivalent
        'lg': '24px',  // p-6 equivalent
        'xl': '32px',  // p-8 equivalent
      },
    },
  },
  plugins: [],
};

export default config;