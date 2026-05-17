import { isKing, isRed } from '../utils/gameRules'

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[44%] h-[44%] drop-shadow-sm">
      <path d="M5 16L3 6l4.5 4L12 4l4.5 6L21 6l-2 10H5zm2 2h10v2H7v-2z" />
    </svg>
  )
}

export default function Piece({ piece, selected, capturing = false }) {
  const red = isRed(piece)
  const king = isKing(piece)

  // Kings are visually larger than regular pieces — this is the ONLY intended size difference.
  // No CSS transforms are used for selected/hover so pieces never appear "randomly large".
  const sizeClass = king ? 'w-[86%] h-[86%]' : 'w-[74%] h-[74%]'

  const colorClass = red
    ? 'bg-gradient-to-br from-[#f04b58] to-[#b02030] border-2 border-[#d0253a]'
    : 'bg-gradient-to-br from-[#2a2a2a] to-[#111111] border-2 border-[#444]'

  const darkColorClass = red
    ? 'dark:from-[#ff6666] dark:to-[#cc2222] dark:border-[#ff4444]'
    : 'dark:from-[#eeeeee] dark:to-[#cccccc] dark:border-[#aaaaaa]'

  // Selection uses a ring only — no scale transform, so no size artifact
  const ringClass = !capturing && selected
    ? 'ring-4 ring-[#f1a208] ring-offset-2 ring-offset-transparent'
    : ''

  // Hover uses shadow only — no scale transform
  const hoverClass = !capturing ? 'hover:shadow-piece-hover cursor-pointer' : 'cursor-default'

  // Transition only shadow, not transform or dimensions
  const transitionClass = 'transition-shadow duration-150'

  const shadowClass = selected ? 'shadow-piece-hover' : 'shadow-piece'

  const captureClass = capturing ? 'piece-capture' : ''

  const textColor = red ? 'text-white' : 'text-[#f1a208]'
  const darkText = red ? '' : 'dark:text-[#111]'

  return (
    <div className={[
      'rounded-full flex items-center justify-center relative',
      sizeClass, colorClass, darkColorClass,
      ringClass, hoverClass, shadowClass, transitionClass, captureClass,
    ].filter(Boolean).join(' ')}>
      {/* Inner gloss */}
      <div className="absolute inset-[14%] rounded-full bg-white/12 pointer-events-none" />
      {/* Crown — only on kings */}
      {king && (
        <span className={`${textColor} ${darkText} flex items-center justify-center w-full h-full pointer-events-none`}>
          <CrownIcon />
        </span>
      )}
    </div>
  )
}
