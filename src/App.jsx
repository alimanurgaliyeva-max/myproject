import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation.jsx'
import Home from './pages/Home.jsx'
import Game from './pages/Game.jsx'
import History from './pages/History.jsx'
import { useTheme } from './hooks/useTheme.js'

export default function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <Navigation theme={theme} toggleTheme={toggleTheme} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
