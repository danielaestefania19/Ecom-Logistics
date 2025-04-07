import { HeroUIProvider } from "@heroui/react"
import AppRoutes from './App.routes.jsx'


/**
 * @component
 * @returns {JSX.Element} The application wrapped with providers.
 */
function App() {
  return (
    <HeroUIProvider>
        <AppRoutes />
    </HeroUIProvider>
  )
}

export default App
