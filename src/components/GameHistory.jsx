import { formatDate, formatDuration } from '../utils/helpers.js'

export default function GameHistory({ history }) {
  if (!history.length) {
    return (
      <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">
        No games yet. Play your first game!
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1 custom-scroll">
      {history.map((game) => (
        <div
          key={game.id}
          className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60"
        >
          <div className="flex items-center gap-2">
            <span className={`
              w-2 h-2 rounded-full flex-shrink-0
              ${game.winner === 'You' ? 'bg-green-500' : game.winner === 'AI' ? 'bg-red-500' : 'bg-yellow-500'}
            `} />
            <div>
              <div className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                {game.winner === 'You' ? 'Victory' : game.winner === 'AI' ? 'Defeat' : 'Draw'}
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(game.date)}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">{game.moves} moves</div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 capitalize">
              {game.difficulty} · {formatDuration(game.duration)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
