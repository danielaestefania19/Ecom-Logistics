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
      colors: {
       primary: '#070A0F',
       secondaty: '#E9E2CD',
       blue: '#19203C',
       third: '#2D596D',
      },
    },
  },
  darkMode: "class",
  plugins: [heroui(), 'flowbite/plugin', 'preline/plugin'],
}

