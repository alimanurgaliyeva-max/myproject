import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { formatDate, formatDuration } from '../utils/helpers.js'
import { Link } from 'react-router-dom'

function StatCard({ label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-1 px-6 py-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</div>
    </div>
  )
}

export default function History() {
  const [history, setHistory] = useLocalStorage('checkers-history', [])

  const wins = history.filter(h => h.winner === 'You').length
  const losses = history.filter(h => h.winner === 'AI').length
  const draws = history.filter(h => h.winner === 'Draw').length
  const winRate = history.length ? Math.round((wins / history.length) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Game History</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Wins" value={wins} color="text-green-500" />
        <StatCard label="Losses" value={losses} color="text-red-500" />
        <StatCard label="Draws" value={draws} color="text-yellow-500" />
        <StatCard label="Win Rate" value={`${winRate}%`} color="text-blue-500" />
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">♟</div>
          <div className="text-gray-500 dark:text-gray-400 mb-4">No games played yet.</div>
          <Link to="/game" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-2.5 rounded-xl transition-all inline-block">
            Play your first game
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {history.map((game, i) => (
              <div
                key={game.id}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <span className="text-gray-400 dark:text-gray-500 text-sm w-6 text-right">{i + 1}</span>
                <span className={`
                  px-2.5 py-1 rounded-lg text-xs font-bold
                  ${game.winner === 'You' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : game.winner === 'AI' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}
                `}>
                  {game.winner === 'You' ? 'WIN' : game.winner === 'AI' ? 'LOSS' : 'DRAW'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    vs AI · {game.difficulty} difficulty
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{formatDate(game.date)}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-gray-600 dark:text-gray-300">{game.moves} moves</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{formatDuration(game.duration)}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => { if (confirm('Clear all history?')) setHistory([]) }}
            className="mt-6 text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Clear history
          </button>
        </>
      )}
    </div>
  )
}
