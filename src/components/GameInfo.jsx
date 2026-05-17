import { PLAYER, GAME_STATUS } from '../utils/constants.js'

function PieceCount({ label, pieces, kings, color, isActive }) {
  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all
      ${isActive
        ? 'bg-yellow-400/10 ring-2 ring-yellow-400/50'
        : 'bg-white/5 dark:bg-black/10'
      }
    `}>
      <div className={`
        w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-md
        ${color === 'red'
          ? 'bg-gradient-to-br from-red-400 to-red-700 text-white'
          : 'bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-400 dark:to-gray-600 text-white'
        }
      `}>
        {pieces}
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{kings} king{kings !== 1 ? 's' : ''}</div>
      </div>
      {isActive && (
        <div className="ml-auto w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
      )}
    </div>
  )
}

export default function GameInfo({ currentPlayer, gameStatus, moveCount, stats, isAiThinking }) {
  const gameOver = gameStatus !== GAME_STATUS.PLAYING

  const statusText = () => {
    if (gameStatus === GAME_STATUS.RED_WINS) return { text: 'You Win! 🎉', cls: 'text-green-500' }
    if (gameStatus === GAME_STATUS.BLACK_WINS) return { text: 'AI Wins', cls: 'text-red-500' }
    if (gameStatus === GAME_STATUS.DRAW) return { text: 'Draw', cls: 'text-yellow-500' }
    if (isAiThinking) return { text: 'AI is thinking…', cls: 'text-blue-400 animate-pulse' }
    if (currentPlayer === PLAYER.RED) return { text: 'Your turn', cls: 'text-yellow-500' }
    return { text: "AI's turn", cls: 'text-blue-400' }
  }

  const { text, cls } = statusText()

  return (
    <div className="flex flex-col gap-3">
      {/* Status */}
      <div className={`text-center text-lg font-bold ${cls}`}>
        {text}
      </div>

      <div className="flex flex-col gap-2">
        <PieceCount
          label="You (Red)"
          pieces={stats.red.pieces}
          kings={stats.red.kings}
          color="red"
          isActive={!gameOver && currentPlayer === PLAYER.RED}
        />
        <PieceCount
          label="AI (Black)"
          pieces={stats.black.pieces}
          kings={stats.black.kings}
          color="black"
          isActive={!gameOver && currentPlayer === PLAYER.BLACK}
        />
      </div>

      {/* Move counter */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
        <span>Moves: <b className="text-gray-700 dark:text-gray-200">{moveCount}</b></span>
        <span>W: <b className="text-green-500">{stats.wins}</b> L: <b className="text-red-500">{stats.losses}</b></span>
      </div>
    </div>
  )
}
