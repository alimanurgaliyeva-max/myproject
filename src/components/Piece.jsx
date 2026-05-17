import { isKing, isRed } from '../utils/gameRules'

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[40%] h-[40%] drop-shadow-sm">
      <path d="M5 16L3 6l4.5 4L12 4l4.5 6L21 6l-2 10H5zm2 2h10v2H7v-2z" />
    </svg>
  )
}

export default function Piece({ piece, selected, isValidTarget }) {
  const red = isRed(piece)
  const king = isKing(piece)

  const baseStyle = `
    w-[78%] h-[78%] rounded-full flex items-center justify-center
    transition-all duration-200 cursor-pointer relative
  `

  const colorStyle = red
    ? 'bg-gradient-to-br from-[#f04b58] to-[#b02030] border-2 border-[#d0253a] shadow-piece'
    : 'bg-gradient-to-br from-[#2a2a2a] to-[#111111] border-2 border-[#444] shadow-piece'

  const darkColorStyle = red
    ? 'dark:from-[#ff7b7b] dark:to-[#cc3333] dark:border-[#ff4444]'
    : 'dark:from-[#f0f0f0] dark:to-[#cccccc] dark:border-[#aaa]'

  const selectedStyle = selected
    ? 'ring-4 ring-[#f1a208] ring-offset-2 ring-offset-transparent scale-110 shadow-piece-hover'
    : 'hover:scale-105 hover:shadow-piece-hover'

  const textColor = red ? 'text-white' : king ? 'text-[#f1a208]' : 'text-[#f1a208]'
  const darkTextColor = red ? '' : 'dark:text-[#1a1a1a]'

  return (
    <div className={`${baseStyle} ${colorStyle} ${darkColorStyle} ${selectedStyle}`}>
      {/* Inner highlight */}
      <div className="absolute inset-[15%] rounded-full bg-white/10 pointer-events-none" />
      {/* Crown */}
      {king && (
        <span className={`${textColor} ${darkTextColor} flex items-center justify-center w-full h-full`}>
          <CrownIcon />
        </span>
      )}
    </div>
  )
}
