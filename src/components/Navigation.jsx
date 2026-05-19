import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Menu, X, Zap, LogOut, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'

function XPBarMini({ progress, level }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-[#f1a208] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
        {level}
      </div>
      <div className="w-20 h-1.5 rounded-full bg-[#e0e0e0] dark:bg-[#333] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#f1a208] transition-all duration-500"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  )
}

export default function Navigation() {
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { profile } = useApp()
  const { user, signOut } = useAuth()
  const dropdownRef = useRef(null)

  const links = [
    { to: '/', label: 'Home' },
    { to: '/play', label: 'Play' },
    { to: '/daily', label: 'Daily' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/history', label: 'History' },
    { to: '/profile', label: 'Profile' },
  ]

  const isActive = to => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  const initial = (profile.username ?? 'P')[0].toUpperCase()

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-[70px] flex items-center border-b border-[#e0e0e0] dark:border-[#333] bg-white/95 dark:bg-[#0d0d0d]/95 backdrop-blur-sm shadow-light">
        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#f1a208] flex items-center justify-center shadow-medium">
              <span className="text-white font-bold text-sm leading-none">D</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-[#1a1a1a] dark:text-white group-hover:text-[#f1a208] transition-colors duration-200">
              DAMA
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            {links.map(({ to, label }) => (
              <Link key={to} to={to} className={`nav-link pb-1 text-sm ${isActive(to) ? 'active' : ''}`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* XP + Coins (desktop) */}
            <div className="hidden md:flex items-center gap-3">
              <XPBarMini progress={profile.progress ?? 0} level={profile.level} />
              <div className="flex items-center gap-1 text-xs font-semibold text-[#f1a208] dark:text-[#ffd700]">
                <Zap size={12} />
                {profile.coins}
              </div>
            </div>

            <button
              onClick={toggle}
              className="btn-ghost w-9 h-9 rounded-lg p-0 flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === 'dark'
                ? <Sun size={17} className="text-[#f1a208]" />
                : <Moon size={17} />}
            </button>

            {/* Auth area */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#f1a208] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {initial}
                  </div>
                  <ChevronDown size={13} className={`text-[#666] dark:text-[#888] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-[#111] border border-[#e0e0e0] dark:border-[#222] rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-[#1e1e1e]">
                      <p className="text-xs text-[#999] dark:text-[#666]">Signed in as</p>
                      <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white truncate">{profile.username}</p>
                    </div>
                    <button
                      onClick={() => { setDropdownOpen(false); signOut() }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#666] dark:text-[#aaa] hover:text-red-500 dark:hover:text-red-400 hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a] transition-colors"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="hidden sm:flex items-center px-3 py-1.5 rounded-lg bg-[#f1a208] hover:bg-[#d98f07] text-white text-sm font-semibold transition-colors"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setMenuOpen(o => !o)}
              className="lg:hidden btn-ghost w-9 h-9 rounded-lg p-0 flex items-center justify-center"
              aria-label="Menu"
            >
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden absolute top-[70px] left-0 right-0 bg-white dark:bg-[#0d0d0d] border-b border-[#e0e0e0] dark:border-[#333] shadow-medium animate-fade-in">
            <div className="flex flex-col px-6 py-4 gap-4">
              {links.map(({ to, label }) => (
                <Link
                  key={to} to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-medium transition-colors ${isActive(to) ? 'text-[#f1a208]' : 'text-[#666] dark:text-[#b0b0b0]'}`}
                >
                  {label}
                </Link>
              ))}
              <div className="pt-2 border-t border-[#e0e0e0] dark:border-[#333] flex items-center gap-4">
                <XPBarMini progress={profile.progress ?? 0} level={profile.level} />
                <span className="text-xs text-[#f1a208] font-semibold flex items-center gap-1">
                  <Zap size={11} />{profile.coins} coins
                </span>
              </div>
              {!user && (
                <button
                  onClick={() => { setMenuOpen(false); setAuthOpen(true) }}
                  className="w-full py-2 rounded-lg bg-[#f1a208] text-white text-sm font-semibold"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  )
}
