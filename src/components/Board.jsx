import Piece from './Piece.jsx'
import { BOARD_SIZE } from '../utils/constants.js'

export default function Board({
  board, selected, handleSquareClick,
  hintSquares, selectableSquares, lastMove, promotedSquare,
}) {
  return (
    <div className="flex flex-col w-full max-w-[min(90vw,90vh,560px)] mx-auto aspect-square">
      {/* Rank labels top */}
      <div className="flex mb-1">
        <div className="w-5" />
        {Array.from({ length: BOARD_SIZE }, (_, c) => (
          <div key={c} className="flex-1 text-center text-[10px] font-medium text-gray-400 dark:text-gray-500">
            {String.fromCharCode(65 + c)}
          </div>
        ))}
      </div>

      <div className="flex flex-1">
        {/* File labels */}
        <div className="flex flex-col w-5">
          {Array.from({ length: BOARD_SIZE }, (_, r) => (
            <div key={r} className="flex-1 flex items-center text-[10px] font-medium text-gray-400 dark:text-gray-500">
              {BOARD_SIZE - r}
            </div>
          ))}
        </div>

        {/* Board grid */}
        <div
          className="flex-1 grid border-2 border-gray-600 dark:border-gray-700 rounded overflow-hidden shadow-2xl"
          style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
        >
          {Array.from({ length: BOARD_SIZE }, (_, row) =>
            Array.from({ length: BOARD_SIZE }, (_, col) => {
              const isDark = (row + col) % 2 === 1
              const piece = board[row][col]
              const isSelected = selected?.row === row && selected?.col === col
              const isHint = hintSquares.find(h => h.row === row && h.col === col)
              const isCaptureHint = isHint?.isCapture
              const isSelectable = !selected && selectableSquares.find(s => s.row === row && s.col === col)
              const isLastMoveFrom = lastMove?.from.row === row && lastMove?.from.col === col
              const isLastMoveTo = lastMove?.to.row === row && lastMove?.to.col === col
              const isPromoted = promotedSquare?.row === row && promotedSquare?.col === col

              return (
                <div
                  key={`${row}-${col}`}
                  onClick={() => isDark && handleSquareClick(row, col)}
                  className={`
                    relative flex items-center justify-center
                    ${isDark
                      ? 'bg-[#b58863] dark:bg-[#7a5c3e] cursor-pointer'
                      : 'bg-[#f0d9b5] dark:bg-[#e8d5a3]'
                    }
                    ${isLastMoveFrom || isLastMoveTo ? 'brightness-110' : ''}
                  `}
                >
                  {/* Last move highlight */}
                  {isDark && (isLastMoveFrom || isLastMoveTo) && (
                    <div className="absolute inset-0 bg-yellow-400/25" />
                  )}

                  {/* Hint dots */}
                  {isDark && isHint && !piece && (
                    <div className={`
                      absolute w-[38%] h-[38%] rounded-full
                      ${isCaptureHint
                        ? 'bg-orange-500/70 ring-2 ring-orange-400/60'
                        : 'bg-yellow-400/60'
                      }
                    `} />
                  )}

                  {/* Capture hint ring on occupied squares */}
                  {isDark && isHint && piece && (
                    <div className="absolute inset-[8%] rounded-full ring-[3px] ring-orange-400/80" />
                  )}

                  {/* Selectable glow */}
                  {isDark && isSelectable && (
                    <div className="absolute inset-0 bg-yellow-300/15 animate-pulse-slow" />
                  )}

                  {piece && (
                    <Piece
                      piece={piece}
                      isSelected={isSelected}
                      isSelectable={!!isSelectable}
                      isPromoted={isPromoted}
                    />
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
