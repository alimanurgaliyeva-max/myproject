import { PLAYER, PIECE_TYPE } from '../utils/constants.js'

export default function Piece({ piece, isSelected, isSelectable, isPromoted }) {
  const isRed = piece.player === PLAYER.RED
  const isKing = piece.type === PIECE_TYPE.KING

  return (
    <div
      className={`
        w-[78%] h-[78%] rounded-full flex items-center justify-center
        transition-all duration-200 select-none
        ${isRed
          ? 'bg-gradient-to-br from-red-400 to-red-700 shadow-[0_3px_6px_rgba(0,0,0,0.4),inset_0_1px_3px_rgba(255,255,255,0.3)]'
          : 'bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-400 dark:to-gray-600 shadow-[0_3px_6px_rgba(0,0,0,0.5),inset_0_1px_3px_rgba(255,255,255,0.15)]'
        }
        ${isSelected ? 'scale-110 ring-4 ring-yellow-400 ring-offset-1' : ''}
        ${isSelectable && !isSelected ? 'ring-2 ring-yellow-300 ring-offset-1 ring-offset-transparent cursor-pointer' : ''}
        ${isPromoted ? 'animate-bounce-in' : ''}
      `}
    >
      {isKing && (
        <span className={`text-lg leading-none font-bold select-none ${isRed ? 'text-yellow-200' : 'text-yellow-300'}`}>
          ♔
        </span>
      )}
    </div>
  )
}
