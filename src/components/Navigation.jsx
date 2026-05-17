import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'

export default function Navigation() {
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { to: '/', label: 'Home' },
    { to: '/play', label: 'Play' },
    { to: '/history', label: 'History' },
  ]

  const isActive = to => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[70px] flex items-center border-b border-[#e0e0e0] dark:border-[#333] bg-white/95 dark:bg-[#0d0d0d]/95 backdrop-blur-sm shadow-light">
      <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#f1a208] flex items-center justify-center shadow-medium">
            <span className="text-white font-bold text-sm leading-none">D</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-[#1a1a1a] dark:text-white group-hover:text-[#f1a208] transition-colors duration-200">
            DAMA
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link pb-1 ${isActive(to) ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="btn-ghost w-9 h-9 rounded-lg p-0 flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {theme === 'dark'
              ? <Sun size={18} className="text-[#f1a208] transition-transform duration-300 rotate-0" />
              : <Moon size={18} className="transition-transform duration-300" />
            }
          </button>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden btn-ghost w-9 h-9 rounded-lg p-0 flex items-center justify-center"
            aria-label="Menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-[70px] left-0 right-0 bg-white dark:bg-[#0d0d0d] border-b border-[#e0e0e0] dark:border-[#333] shadow-medium animate-fade-in">
          <div className="flex flex-col px-6 py-4 gap-4">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium transition-colors ${isActive(to) ? 'text-[#f1a208]' : 'text-[#666] dark:text-[#b0b0b0]'}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
