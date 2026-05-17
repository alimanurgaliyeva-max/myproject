import { Crown, Zap } from 'lucide-react'
import { PLAYER, GAME_MODE } from '../utils/constants'

function ThinkingDots() {
  return (
    <span className="inline-flex gap-1 ml-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="thinking-dot w-1.5 h-1.5 rounded-full bg-[#f1a208]"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  )
}

function CapturedPieces({ count, color }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Array(count).fill(null).map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full border ${
            color === 'red'
              ? 'bg-gradient-to-br from-[#f04b58] to-[#b02030] border-[#d0253a]'
              : 'bg-gradient-to-br from-[#2a2a2a] to-[#111] border-[#444] dark:from-[#f0f0f0] dark:to-[#ccc] dark:border-[#aaa]'
          }`}
        />
      ))}
      {count === 0 && <span className="text-[#999] dark:text-[#555] text-xs">None yet</span>}
    </div>
  )
}

export default function GameInfo({ currentPlayer, aiThinking, moveCount, capturedRed, capturedBlack, status, winner, mode }) {
  const isOver = status === 'over'

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Current turn */}
      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#999] dark:text-[#555] mb-3">Current Turn</p>
        {isOver ? (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-piece ${
              winner === PLAYER.RED
                ? 'bg-gradient-to-br from-[#f04b58] to-[#b02030]'
                : 'bg-gradient-to-br from-[#2a2a2a] to-[#111] dark:from-[#f0f0f0] dark:to-[#ccc]'
            }`} />
            <div>
              <p className="font-bold text-[#f1a208] dark:text-[#ffd700]">Game Over</p>
              <p className="text-sm text-[#666] dark:text-[#b0b0b0]">
                {winner === PLAYER.RED ? 'Red wins!' : mode === GAME_MODE.AI ? 'AI wins!' : 'Black wins!'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex-shrink-0 shadow-piece transition-all duration-300 ${
              currentPlayer === PLAYER.RED
                ? 'bg-gradient-to-br from-[#f04b58] to-[#b02030] border-2 border-[#d0253a]'
                : 'bg-gradient-to-br from-[#2a2a2a] to-[#111] border-2 border-[#444] dark:from-[#f0f0f0] dark:to-[#ccc] dark:border-[#aaa]'
            }`} />
            <div>
              <p className="font-semibold text-sm">
                {currentPlayer === PLAYER.RED ? 'Red' : mode === GAME_MODE.AI ? 'AI (Black)' : 'Black'}
              </p>
              {aiThinking ? (
                <p className="text-xs text-[#666] dark:text-[#b0b0b0] flex items-center">
                  Thinking<ThinkingDots />
                </p>
              ) : (
                <p className="text-xs text-[#666] dark:text-[#b0b0b0]">
                  {currentPlayer === PLAYER.RED ? 'Your turn' : mode === GAME_MODE.AI ? 'AI is moving...' : 'Black\'s turn'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#999] dark:text-[#555] mb-3">Match Stats</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#999] dark:text-[#555]">Moves</span>
            <span className="text-2xl font-bold">{moveCount}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#999] dark:text-[#555]">Captures</span>
            <span className="text-2xl font-bold">{capturedRed + capturedBlack}</span>
          </div>
        </div>
      </div>

      {/* Captured pieces */}
      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#999] dark:text-[#555] mb-3">Captured Pieces</p>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-[#666] dark:text-[#b0b0b0] mb-1.5">Red captured ({capturedRed})</p>
            <CapturedPieces count={capturedRed} color="red" />
          </div>
          <div>
            <p className="text-xs text-[#666] dark:text-[#b0b0b0] mb-1.5">Black captured ({capturedBlack})</p>
            <CapturedPieces count={capturedBlack} color="black" />
          </div>
        </div>
      </div>
    </div>
  )
}
