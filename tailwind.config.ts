import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'spin-slow': 'spin 2s linear',
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'slideIn': 'slideIn 0.3s ease-in-out',
        'sunRise': 'sunRise 0.5s ease forwards',
        'moonRise': 'moonRise 0.5s ease forwards',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
        'spin': 'spin 1s linear infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'gradient': 'gradientShift 3s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        sunRise: {
          '0%': { transform: 'translateY(20px) scale(0.7)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        moonRise: {
          '0%': { transform: 'translateY(-20px) scale(0.7)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        spin: {
          'to': { transform: 'rotate(360deg)' },
        },
        ping: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      transitionProperty: {
        'width': 'width',
        'height': 'height',
        'spacing': 'margin, padding',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      colors: {
        blue: {
          50: 'rgba(239, 246, 255, 1)',
          100: 'rgba(219, 234, 254, 1)',
          500: 'rgba(59, 130, 246, 1)',
          600: 'rgba(37, 99, 235, 1)',
        },
        green: {
          50: 'rgba(240, 253, 244, 1)',
          100: 'rgba(220, 252, 231, 1)',
          500: 'rgba(34, 197, 94, 1)',
          600: 'rgba(22, 163, 74, 1)',
        },
        orange: {
          50: 'rgba(255, 247, 237, 1)',
          100: 'rgba(255, 237, 213, 1)',
          500: 'rgba(249, 115, 22, 1)',
          600: 'rgba(234, 88, 12, 1)',
        },
        indigo: {
          50: 'rgba(238, 242, 255, 1)',
          100: 'rgba(224, 231, 255, 1)',
          500: 'rgba(99, 102, 241, 1)',
          600: 'rgba(79, 70, 229, 1)',
        },
        purple: {
          50: 'rgba(250, 245, 255, 1)',
          100: 'rgba(243, 232, 255, 1)',
          500: 'rgba(168, 85, 247, 1)',
          600: 'rgba(147, 51, 234, 1)',
        },
        yellow: {
          50: 'rgba(254, 252, 232, 1)',
          100: 'rgba(254, 249, 195, 1)',
          500: 'rgba(234, 179, 8, 1)',
          600: 'rgba(202, 138, 4, 1)',
        },
        red: {
          50: 'rgba(254, 242, 242, 1)',
          100: 'rgba(254, 226, 226, 1)',
          500: 'rgba(239, 68, 68, 1)',
          600: 'rgba(220, 38, 38, 1)',
        },
      },
    },
  },
  safelist: [
    // Background colors
    'bg-blue-50', 'bg-blue-100', 'bg-blue-500', 'bg-blue-600',
    'bg-green-50', 'bg-green-100', 'bg-green-500', 'bg-green-600',
    'bg-orange-50', 'bg-orange-100', 'bg-orange-500', 'bg-orange-600',
    'bg-indigo-50', 'bg-indigo-100', 'bg-indigo-500', 'bg-indigo-600',
    'bg-purple-50', 'bg-purple-100', 'bg-purple-500', 'bg-purple-600',
    'bg-yellow-50', 'bg-yellow-100', 'bg-yellow-500', 'bg-yellow-600',
    'bg-red-50', 'bg-red-100', 'bg-red-500', 'bg-red-600',
    
    // Text colors
    'text-blue-500', 'text-blue-600',
    'text-green-500', 'text-green-600',
    'text-orange-500', 'text-orange-600',
    'text-indigo-500', 'text-indigo-600',
    'text-purple-500', 'text-purple-600',
    'text-yellow-500', 'text-yellow-600',
    'text-red-500', 'text-red-600',
    
    // Hover states
    'hover:bg-blue-50', 'hover:bg-blue-100',
    'hover:bg-green-50', 'hover:bg-green-100',
    'hover:bg-orange-50', 'hover:bg-orange-100',
    'hover:bg-indigo-50', 'hover:bg-indigo-100',
    'hover:bg-purple-50', 'hover:bg-purple-100',
    'hover:bg-yellow-50', 'hover:bg-yellow-100',
    'hover:bg-red-50', 'hover:bg-red-100',
    
    // Shadow utilities
    'shadow-blue-500/20', 'shadow-green-500/20', 'shadow-orange-500/20',
    'shadow-indigo-500/20', 'shadow-purple-500/20', 'shadow-yellow-500/20',
    'shadow-red-500/20',
    
    // Animation classes
    'animate-fadeIn', 'animate-slideIn', 'animate-pulse', 'animate-bounce',
    'animate-spin', 'animate-ping', 'animate-gradient',
  ],
  plugins: [],
};
export default config;