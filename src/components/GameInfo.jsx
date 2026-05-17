import { PLAYER, GAME_MODE, AI_OPPONENTS } from '../utils/constants'

function ThinkingDots() {
  return (
    <span className="inline-flex gap-1 ml-1">
      {[0, 1, 2].map(i => (
        <span key={i} className="thinking-dot w-1.5 h-1.5 rounded-full bg-[#f1a208]" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </span>
  )
}

function CapturedRow({ count, color }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Array(count).fill(null).map((_, i) => (
        <div key={i} className={`w-3.5 h-3.5 rounded-full border ${color === 'red'
          ? 'bg-gradient-to-br from-[#f04b58] to-[#b02030] border-[#d0253a]'
          : 'bg-gradient-to-br from-[#2a2a2a] to-[#111] border-[#444] dark:from-[#f0f0f0] dark:to-[#ccc] dark:border-[#aaa]'
        }`} />
      ))}
      {count === 0 && <span className="text-[11px] text-[#ccc] dark:text-[#555]">None</span>}
    </div>
  )
}

export default function GameInfo({ currentPlayer, aiThinking, moveCount, capturedRed, capturedBlack, status, winner, mode, difficulty }) {
  const isOver = status === 'over'
  const ai = AI_OPPONENTS[difficulty]

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Turn indicator */}
      <div className="card">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] dark:text-[#555] mb-3">
          {isOver ? 'Result' : 'Current Turn'}
        </p>
        {isOver ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{winner === PLAYER.RED ? '🏆' : '😤'}</span>
            <div>
              <p className="font-bold text-[#f1a208] dark:text-[#ffd700]">Game Over</p>
              <p className="text-sm text-[#666] dark:text-[#b0b0b0]">
                {winner === PLAYER.RED ? 'Red wins!' : mode === GAME_MODE.AI ? `${ai?.name ?? 'AI'} wins!` : 'Black wins!'}
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
                {currentPlayer === PLAYER.RED ? 'Red' : mode === GAME_MODE.AI ? `${ai?.name ?? 'AI'} (Black)` : 'Black'}
              </p>
              {aiThinking
                ? <p className="text-xs text-[#666] dark:text-[#b0b0b0] flex items-center">Thinking<ThinkingDots /></p>
                : <p className="text-xs text-[#666] dark:text-[#b0b0b0]">
                    {currentPlayer === PLAYER.RED ? 'Your turn' : 'Moving...'}
                  </p>}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="card">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] dark:text-[#555] mb-3">Match Stats</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[11px] text-[#999] dark:text-[#555]">Moves</span>
            <p className="text-2xl font-bold">{moveCount}</p>
          </div>
          <div>
            <span className="text-[11px] text-[#999] dark:text-[#555]">Captures</span>
            <p className="text-2xl font-bold">{capturedRed + capturedBlack}</p>
          </div>
        </div>
      </div>

      {/* Captured pieces */}
      <div className="card">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] dark:text-[#555] mb-3">Captured</p>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[11px] text-[#666] dark:text-[#b0b0b0] mb-1.5">By Red ({capturedRed})</p>
            <CapturedRow count={capturedRed} color="black" />
          </div>
          <div>
            <p className="text-[11px] text-[#666] dark:text-[#b0b0b0] mb-1.5">By {mode === GAME_MODE.AI ? (ai?.name ?? 'AI') : 'Black'} ({capturedBlack})</p>
            <CapturedRow count={capturedBlack} color="red" />
          </div>
        </div>
      </div>
    </div>
  )
}
