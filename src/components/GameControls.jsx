import { RotateCcw, HelpCircle, Flag } from 'lucide-react'

export default function GameControls({ onNewGame, onResign, status }) {
  return (
    <div className="flex items-center gap-3 w-full">
      <button onClick={onNewGame} className="btn-primary flex-1 gap-2 py-3 text-sm">
        <RotateCcw size={15} />
        New Game
      </button>
      {status === 'playing' && onResign && (
        <button onClick={onResign} className="btn-secondary px-4 py-3 gap-2 text-sm text-[#e63946] border-[#e63946]/30 hover:border-[#e63946]">
          <Flag size={15} />
          Resign
        </button>
      )}
      <button
        className="btn-secondary px-4 py-3 gap-2 text-sm"
        onClick={() => alert(
          'Dama Rules:\n\n' +
          '• Red moves up, Black moves down\n' +
          '• Capture by jumping over opponent pieces diagonally\n' +
          '• Captures are mandatory when available\n' +
          '• Reach the opposite end to become a King\n' +
          '• Kings can move in all 4 diagonal directions\n' +
          '• Win by capturing all opponent pieces or blocking them'
        )}
      >
        <HelpCircle size={15} />
      </button>
    </div>
  )
}
