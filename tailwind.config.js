/** @type {import('tailwindcss').Config} */
import { heroui } from "@heroui/react";

export default {
  content: [
    "./src/**/*.{js,ts,tsx,jsx,css}", 
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    'node_modules/flowbite-react/lib/esm/**/*.js',
    'node_modules/preline/dist/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },

      colors: {
       primary: '#070A0F',
       secondary: '#E9E2CD',
       blue: '#19203C',
       third: '#2D596D',
       white: '#FFFFFF'
      },
    },
  },
  darkMode: "class",
  plugins: [heroui(), 'flowbite/plugin', 'preline/plugin'],
}

