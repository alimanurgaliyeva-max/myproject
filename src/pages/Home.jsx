import { Link } from 'react-router-dom'

const FEATURES = [
  { icon: '🎮', title: 'Full Rules', desc: 'Mandatory captures, king promotion, chain jumps' },
  { icon: '🤖', title: 'AI Opponent', desc: 'Minimax AI with Easy and Hard difficulty' },
  { icon: '💡', title: 'Move Hints', desc: 'Legal moves highlighted when you select a piece' },
  { icon: '📜', title: 'Game History', desc: 'Last 10 games saved locally' },
  { icon: '🌙', title: 'Dark Mode', desc: 'Comfortable dark and light themes' },
  { icon: '📱', title: 'Responsive', desc: 'Plays great on any screen size' },
]

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 gap-12">
      {/* Hero */}
      <div className="text-center max-w-xl">
        <div className="text-7xl mb-4 select-none">♟</div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          Play Checkers
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
          A classic board game against a smart AI. Can you win on Hard?
        </p>
        <Link
          to="/game"
          className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-lg px-8 py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          Start Playing →
        </Link>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl w-full">
        {FEATURES.map(f => (
          <div
            key={f.title}
            className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="text-2xl mb-2">{f.icon}</div>
            <div className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-0.5">{f.title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
