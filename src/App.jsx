import { HeroUIProvider } from "@heroui/react"

/**
 * @component
 * @returns {JSX.Element} The application wrapped with providers.
 */
function App() {
  return (
    <HeroUIProvider>
    Hello Ecologistic 
    </HeroUIProvider>
  )
}

export default App
