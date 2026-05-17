import { NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.jsx'

export default function Navigation({ theme, toggleTheme }) {
  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors px-3 py-1.5 rounded-lg
    ${isActive
      ? 'text-yellow-500 bg-yellow-400/10'
      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
    }`

  return (
    <nav className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-1.5">
        <span className="text-2xl">♟</span>
        <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Checkers</span>
      </div>

      <div className="flex items-center gap-1">
        <NavLink to="/" end className={linkClass}>Home</NavLink>
        <NavLink to="/game" className={linkClass}>Play</NavLink>
        <NavLink to="/history" className={linkClass}>History</NavLink>
      </div>

      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
    </nav>
  )
}
