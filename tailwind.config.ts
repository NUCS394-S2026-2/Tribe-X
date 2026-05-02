import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'team-red': '#D32F2F',
        'team-blue': '#1565C0',
        'team-orange': '#E65100',
        'team-yellow': '#F9A825',
      },
    },
  },
  plugins: [],
} satisfies Config;
