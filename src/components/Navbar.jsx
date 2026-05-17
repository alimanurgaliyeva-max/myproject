import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';

export default function Navbar() {
  const location = useLocation();
  const { toggleTheme, theme, toggleSound, soundEnabled, handleLogoClick, easterEggUnlocked } = useGame();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/play', label: 'Играть' },
    { to: '/leaderboard', label: 'Лидерборд' },
    { to: '/how-to-play', label: 'Как играть' },
    { to: '/pro', label: 'Pro ✨' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="glass rounded-2xl max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" onClick={handleLogoClick}>
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative w-9 h-9">
              <div className="w-full h-full rounded-full piece-p1 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
              </div>
              {easterEggUnlocked && (
                <motion.div
                  className="absolute -top-1 -right-1 text-xs"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 360] }}
                  transition={{ type: 'spring' }}
                >
                  🚀
                </motion.div>
              )}
            </div>
            <span className="font-display text-xl font-bold gradient-text">Dama</span>
          </motion.div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link text-sm ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSound}
            className="glass rounded-xl p-2 text-lg"
            title={soundEnabled ? 'Выкл звук' : 'Вкл звук'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="glass rounded-xl p-2 text-lg"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden glass rounded-xl p-2 text-lg"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-2xl max-w-6xl mx-auto mt-2 px-6 py-4 md:hidden"
          >
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-3 nav-link text-sm border-b border-white/20 last:border-0"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
