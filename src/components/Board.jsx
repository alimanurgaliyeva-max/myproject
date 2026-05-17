import Piece from './Piece'
import { BOARD_SIZE, BOARD_THEMES } from '../utils/constants'

export default function Board({ board, selected, validMoves, lastMove, lastCaptures = [], onSquareClick, boardTheme = 'classic' }) {
  const validTargets = new Set(validMoves.map(m => `${m.to[0]}-${m.to[1]}`))
  const lastFrom = lastMove ? `${lastMove.from[0]}-${lastMove.from[1]}` : null
  const lastTo = lastMove ? `${lastMove.to[0]}-${lastMove.to[1]}` : null
  const theme = BOARD_THEMES[boardTheme] ?? BOARD_THEMES.classic

  // Map "row-col" → piece for capture ghost rendering
  const captureMap = new Map(lastCaptures.map(c => [`${c.row}-${c.col}`, c.piece]))

  return (
    <div className="relative w-full max-w-[600px] aspect-square rounded-xl overflow-hidden shadow-heavy border border-[#e0e0e0] dark:border-[#333]">
      <div className="grid grid-cols-8 w-full h-full">
        {Array(BOARD_SIZE).fill(null).map((_, row) =>
          Array(BOARD_SIZE).fill(null).map((_, col) => {
            const isDark = (row + col) % 2 === 1
            const key = `${row}-${col}`
            const piece = board[row][col]
            const isSelected = selected && selected[0] === row && selected[1] === col
            const isTarget = validTargets.has(key)
            const isLastMove = key === lastFrom || key === lastTo
            const ghostPiece = captureMap.get(key)

            return (
              <div
                key={key}
                className="relative flex items-center justify-center cursor-pointer transition-colors duration-150"
                style={{
                  backgroundColor: isDark
                    ? isLastMove ? adjustColor(theme.dark, 30) : theme.dark
                    : isLastMove ? adjustColor(theme.light, -15) : theme.light,
                }}
                onClick={() => onSquareClick(row, col)}
              >
                {/* Valid move hint dot */}
                {isTarget && !piece && (
                  <div className="w-[32%] h-[32%] rounded-full valid-move-hint" style={{ backgroundColor: 'rgba(241,162,8,0.65)' }} />
                )}
                {/* Valid capture ring */}
                {isTarget && piece && (
                  <div className="absolute inset-[8%] rounded-full border-2 border-[#f1a208]/80 valid-move-hint pointer-events-none" />
                )}
                {/* Live piece */}
                {piece && (
                  <Piece piece={piece} selected={isSelected} />
                )}
                {/* Animated ghost for captured piece */}
                {ghostPiece && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Piece piece={ghostPiece} selected={false} capturing />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Board coordinates */}
      <div className="absolute inset-0 pointer-events-none">
        {Array(BOARD_SIZE).fill(null).map((_, i) => (
          <div key={`r${i}`} className="absolute text-[8px] font-bold text-white/40 leading-none" style={{ top: `${(i / 8) * 100 + 0.8}%`, left: 3 }}>
            {BOARD_SIZE - i}
          </div>
        ))}
        {Array(BOARD_SIZE).fill(null).map((_, i) => (
          <div key={`c${i}`} className="absolute text-[8px] font-bold text-white/40 leading-none" style={{ bottom: 3, left: `${(i / 8) * 100 + 0.8}%` }}>
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
    </div>
  )
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount))
  return `rgb(${r},${g},${b})`
}
