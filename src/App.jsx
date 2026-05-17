import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navigation from './components/Navigation'
import AchievementToast from './components/AchievementToast'
import Home from './pages/Home'
import Game from './pages/Game'
import History from './pages/History'
import Profile from './pages/Profile'
import Achievements from './pages/Achievements'
import DailyChallenge from './pages/DailyChallenge'
import Tutorials from './pages/Tutorials'
import { useTheme } from './hooks/useTheme'

function ThemeInit() {
  useTheme()
  return null
}

export default function App() {
  return (
    <AppProvider>
      <ThemeInit />
      <Navigation />
      <AchievementToast />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Game />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/daily" element={<DailyChallenge />} />
        <Route path="/tutorials" element={<Tutorials />} />
      </Routes>
    </AppProvider>
  )
}
