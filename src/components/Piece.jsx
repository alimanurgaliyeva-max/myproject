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

  const sizeClass    = king ? 'w-[86%] h-[86%]' : 'w-[74%] h-[74%]'
  const colorClass   = red ? 'piece-3d-red' : 'piece-3d-black'
  const selectedClass = !capturing && selected ? 'piece-3d-selected' : ''
  const hoverClass   = !capturing ? 'cursor-pointer' : 'cursor-default'
  const captureClass = capturing ? 'piece-capture' : ''
  const textColor    = red ? 'text-white' : 'text-[#f1a208]'
  const darkText     = red ? '' : 'dark:text-[#111]'

  return (
    <div className={[
      'rounded-full flex items-center justify-center relative',
      sizeClass, colorClass, selectedClass, hoverClass, captureClass,
    ].filter(Boolean).join(' ')}>
      {king && (
        <span className={`${textColor} ${darkText} flex items-center justify-center w-full h-full pointer-events-none`}>
          <CrownIcon />
        </span>
      )}
    </div>
  )
}
