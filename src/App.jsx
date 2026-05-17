import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Game from './pages/Game'
import History from './pages/History'
import { useTheme } from './hooks/useTheme'

export default function App() {
  useTheme()
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Game />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </>
  )
}
