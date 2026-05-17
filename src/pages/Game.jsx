import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Bot, Users } from 'lucide-react'
import { useState } from 'react'
import Board from '../components/Board'
import GameInfo from '../components/GameInfo'
import GameControls from '../components/GameControls'
import { useGameLogic } from '../hooks/useGameLogic'
import { GAME_MODE, DIFFICULTY } from '../utils/constants'

const DIFFICULTY_LABELS = {
  [DIFFICULTY.EASY]: 'Easy',
  [DIFFICULTY.MEDIUM]: 'Medium',
  [DIFFICULTY.HARD]: 'Hard',
}

function DifficultyPicker({ value, onChange }) {
  return (
    <div className="flex rounded-lg border border-[#e0e0e0] dark:border-[#333] overflow-hidden">
      {Object.values(DIFFICULTY).map(d => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`flex-1 px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
            value === d
              ? 'bg-[#f1a208] text-white'
              : 'bg-transparent text-[#666] dark:text-[#b0b0b0] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a]'
          }`}
        >
          {DIFFICULTY_LABELS[d]}
        </button>
      ))}
    </div>
  )
}

export default function Game() {
  const [params] = useSearchParams()
  const rawMode = params.get('mode') === 'local' ? GAME_MODE.LOCAL : GAME_MODE.AI
  const [mode] = useState(rawMode)
  const [difficulty, setDifficulty] = useState(DIFFICULTY.MEDIUM)
  const [gameKey, setGameKey] = useState(0)

  const game = useGameLogic(mode, difficulty)

  const handleNewGame = () => {
    game.reset()
    setGameKey(k => k + 1)
  }

  const handleDifficultyChange = d => {
    setDifficulty(d)
    game.reset()
  }

  return (
    <div className="min-h-screen pt-[70px] animate-fade-in bg-white dark:bg-[#0d0d0d]">
      {/* Top bar */}
      <div className="border-b border-[#e0e0e0] dark:border-[#333] bg-[#f5f5f5] dark:bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link to="/" className="btn-ghost gap-2 text-sm">
              <ArrowLeft size={15} />
              Home
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-[#666] dark:text-[#b0b0b0]">
              {mode === GAME_MODE.AI ? <Bot size={15} /> : <Users size={15} />}
              {mode === GAME_MODE.AI ? 'vs AI' : 'Local Multiplayer'}
            </div>
          </div>
          {mode === GAME_MODE.AI && (
            <DifficultyPicker value={difficulty} onChange={handleDifficultyChange} />
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Board + Controls */}
          <div className="flex flex-col gap-5 w-full lg:w-auto items-center">
            <Board
              key={gameKey}
              board={game.board}
              selected={game.selected}
              validMoves={game.validMoves}
              lastMove={game.lastMove}
              onSquareClick={game.handleSquareClick}
            />
            <div className="w-full max-w-[600px]">
              <GameControls onNewGame={handleNewGame} status={game.status} />
            </div>
          </div>

          {/* Info sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <GameInfo
              currentPlayer={game.currentPlayer}
              aiThinking={game.aiThinking}
              moveCount={game.moveCount}
              capturedRed={game.capturedRed}
              capturedBlack={game.capturedBlack}
              status={game.status}
              winner={game.winner}
              mode={mode}
            />
          </div>
        </div>
      </div>

      {/* Game over overlay */}
      {game.status === 'over' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-sm w-full mx-4 text-center p-8 shadow-heavy animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-[#f1a208]/10 dark:bg-[#ffd700]/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👑</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Game Over</h2>
            <p className="text-[#666] dark:text-[#b0b0b0] mb-6">
              {game.winner === 'red'
                ? 'Red wins the match!'
                : mode === GAME_MODE.AI
                ? 'The AI wins this round!'
                : 'Black wins the match!'}
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleNewGame} className="btn-primary w-full justify-center">
                Play Again
              </button>
              <Link to="/" className="btn-secondary w-full justify-center">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
