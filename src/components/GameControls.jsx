import { useState } from 'react'
import { AI_DIFFICULTY, GAME_STATUS } from '../utils/constants.js'

export default function GameControls({
  onNewGame, onUndo, canUndo,
  aiDifficulty, setAiDifficulty,
  showHints, setShowHints,
  gameStatus,
}) {
  const [confirmNew, setConfirmNew] = useState(false)
  const gameOver = gameStatus !== GAME_STATUS.PLAYING

  const handleNewGame = () => {
    if (gameOver || confirmNew) {
      onNewGame()
      setConfirmNew(false)
    } else {
      setConfirmNew(true)
      setTimeout(() => setConfirmNew(false), 3000)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Primary actions */}
      <div className="flex gap-2">
        <button
          onClick={handleNewGame}
          className={`
            flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all
            ${confirmNew
              ? 'bg-orange-500 hover:bg-orange-600 text-white ring-2 ring-orange-300'
              : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
            }
          `}
        >
          {confirmNew ? 'Confirm?' : gameOver ? 'Play Again' : 'New Game'}
        </button>

        <button
          onClick={onUndo}
          disabled={!canUndo || gameOver}
          className="py-2.5 px-4 rounded-xl text-sm font-semibold bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Undo
        </button>
      </div>

      {/* Settings row */}
      <div className="flex gap-2">
        {/* Difficulty */}
        <div className="flex-1 flex rounded-xl overflow-hidden ring-1 ring-gray-300 dark:ring-gray-600 text-xs font-semibold">
          {[AI_DIFFICULTY.EASY, AI_DIFFICULTY.HARD].map(d => (
            <button
              key={d}
              onClick={() => setAiDifficulty(d)}
              className={`
                flex-1 py-2 capitalize transition-all
                ${aiDifficulty === d
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Hints toggle */}
        <button
          onClick={() => setShowHints(h => !h)}
          className={`
            flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ring-1
            ${showHints
              ? 'bg-blue-500 text-white ring-blue-400'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 ring-gray-300 dark:ring-gray-600'
            }
          `}
        >
          <span>💡</span> Hints
        </button>
      </div>
    </div>
  )
}
