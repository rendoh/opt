import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}', './pages/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      keyframes: {
        progressBarBg: {
          from: {
            backgroundPosition: '0 0',
          },
          to: {
            backgroundPosition: '20px 0',
          },
        },
      },
    },
    tokens: {
      colors: {
        red: { value: '#cd4246' },
        redLight: { value: '#f5e3e4' },
        green: { value: '#00a396' },
      },
    },
    semanticTokens: {
      colors: {
        danger: { value: '{colors.red}' },
        success: { value: '{colors.green}' },
      },
    },
  },

  // The output directory for your css system
  outdir: 'styled-system',

  globalCss: {
    body: {
      color: '#333',
      fontSize: '14px',
      lineHeight: '1.5',
    },
  },
});
