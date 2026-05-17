export default function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="w-9 h-9 rounded-full flex items-center justify-center text-lg
        bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
        transition-all shadow-sm"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
