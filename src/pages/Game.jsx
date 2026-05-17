import { GAME_STATUS } from '../utils/constants.js'
import Board from '../components/Board.jsx'
import GameInfo from '../components/GameInfo.jsx'
import GameControls from '../components/GameControls.jsx'
import GameHistory from '../components/GameHistory.jsx'
import { useGameLogic } from '../hooks/useGameLogic.js'

function GameOverBanner({ gameStatus, onNewGame }) {
  if (gameStatus === GAME_STATUS.PLAYING) return null

  const isWin = gameStatus === GAME_STATUS.RED_WINS
  const isDraw = gameStatus === GAME_STATUS.DRAW

  return (
    <div className={`
      text-center py-3 px-4 rounded-xl font-bold text-sm
      ${isWin ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
        : isDraw ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}
    `}>
      {isWin ? '🎉 You win! Congrats!' : isDraw ? "It's a draw!" : '😢 AI wins this round.'}
      {' '}
      <button onClick={onNewGame} className="underline ml-1">Play again?</button>
    </div>
  )
}

export default function Game() {
  const {
    board, currentPlayer, selected, gameStatus, moveCount,
    hintSquares, selectableSquares, lastMove, isAiThinking,
    aiDifficulty, setAiDifficulty, showHints, setShowHints,
    handleSquareClick, newGame, undo, canUndo,
    history, stats, promotedSquare,
  } = useGameLogic()

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto px-4 py-6 min-h-[calc(100vh-60px)]">
      {/* Board (center) */}
      <div className="flex-1 flex flex-col gap-4">
        <GameOverBanner gameStatus={gameStatus} onNewGame={newGame} />

        <Board
          board={board}
          selected={selected}
          handleSquareClick={handleSquareClick}
          hintSquares={hintSquares}
          selectableSquares={selectableSquares}
          lastMove={lastMove}
          promotedSquare={promotedSquare}
        />
      </div>

      {/* Sidebar */}
      <div className="lg:w-72 flex flex-col gap-4">
        {/* Game info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
          <GameInfo
            currentPlayer={currentPlayer}
            gameStatus={gameStatus}
            moveCount={moveCount}
            stats={stats}
            isAiThinking={isAiThinking}
          />
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Controls</h2>
          <GameControls
            onNewGame={newGame}
            onUndo={undo}
            canUndo={canUndo}
            aiDifficulty={aiDifficulty}
            setAiDifficulty={setAiDifficulty}
            showHints={showHints}
            setShowHints={setShowHints}
            gameStatus={gameStatus}
          />
        </div>

        {/* History */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Recent Games</h2>
          <GameHistory history={history} />
        </div>
      </div>
    </div>
  )
}
