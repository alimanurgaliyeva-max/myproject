import Piece from './Piece'
import { BOARD_SIZE } from '../utils/constants'

export default function Board({ board, selected, validMoves, lastMove, onSquareClick }) {
  const validTargets = new Set(validMoves.map(m => `${m.to[0]}-${m.to[1]}`))
  const lastFrom = lastMove ? `${lastMove.from[0]}-${lastMove.from[1]}` : null
  const lastTo = lastMove ? `${lastMove.to[0]}-${lastMove.to[1]}` : null

  return (
    <div className="relative w-full max-w-[600px] aspect-square rounded-xl overflow-hidden shadow-heavy border border-[#e0e0e0] dark:border-[#333]">
      {/* Board grid */}
      <div className="grid grid-cols-8 w-full h-full">
        {Array(BOARD_SIZE).fill(null).map((_, row) =>
          Array(BOARD_SIZE).fill(null).map((_, col) => {
            const isDark = (row + col) % 2 === 1
            const key = `${row}-${col}`
            const piece = board[row][col]
            const isSelected = selected && selected[0] === row && selected[1] === col
            const isTarget = validTargets.has(key)
            const isLastFrom = lastFrom === key
            const isLastTo = lastTo === key

            let bgClass = ''
            if (isDark) {
              bgClass = 'bg-board-dark dark:bg-board-dark-dark'
              if (isLastFrom || isLastTo) bgClass = 'bg-[#c8a96e] dark:bg-[#6b5c3c]'
            } else {
              bgClass = 'bg-board-light dark:bg-board-dark-light'
            }

            return (
              <div
                key={key}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${bgClass}`}
                onClick={() => onSquareClick(row, col)}
              >
                {/* Valid move dot */}
                {isTarget && !piece && (
                  <div className="w-[32%] h-[32%] rounded-full bg-[#f1a208]/70 dark:bg-[#ffd700]/60 valid-move-hint shadow-sm" />
                )}
                {/* Valid capture ring */}
                {isTarget && piece && (
                  <div className="absolute inset-[8%] rounded-full border-2 border-[#f1a208]/80 dark:border-[#ffd700]/80 valid-move-hint pointer-events-none" />
                )}
                {/* Piece */}
                {piece && (
                  <Piece
                    piece={piece}
                    selected={isSelected}
                    isValidTarget={isTarget}
                  />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Row/col labels */}
      <div className="absolute inset-0 pointer-events-none">
        {Array(BOARD_SIZE).fill(null).map((_, i) => (
          <div
            key={`row-${i}`}
            className="absolute text-[9px] font-medium text-[#8b6f47]/60 dark:text-[#b0b0b0]/40"
            style={{ top: `${(i / 8) * 100 + 0.5}%`, left: '2px' }}
          >
            {BOARD_SIZE - i}
          </div>
        ))}
        {Array(BOARD_SIZE).fill(null).map((_, i) => (
          <div
            key={`col-${i}`}
            className="absolute text-[9px] font-medium text-[#8b6f47]/60 dark:text-[#b0b0b0]/40"
            style={{ bottom: '2px', left: `${(i / 8) * 100 + 0.5}%` }}
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
    </div>
  )
}
