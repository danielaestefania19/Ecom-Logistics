import React from 'react'
import { HeroUIProvider } from "@heroui/react"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import AppRoutes from './App.routes.jsx'

/**
 * @component
 * @returns {JSX.Element} The application wrapped with providers.
 */
function App() {
  return (
    <HeroUIProvider>
      <AppRoutes />
      <ToastContainer/>
    </HeroUIProvider>
  )
}

export default App
