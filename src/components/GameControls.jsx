import { RotateCcw, HelpCircle } from 'lucide-react'

export default function GameControls({ onNewGame, status }) {
  return (
    <div className="flex items-center gap-3 w-full">
      <button
        onClick={onNewGame}
        className="btn-primary flex-1 gap-2 py-3"
      >
        <RotateCcw size={16} />
        New Game
      </button>
      <button
        className="btn-secondary px-4 py-3 gap-2"
        onClick={() => {
          alert(
            'Dama Rules:\n\n' +
            '• Red moves up, Black moves down\n' +
            '• Capture by jumping over opponent pieces\n' +
            '• Captures are mandatory\n' +
            '• Reach the opposite end to become a King\n' +
            '• Kings can move in all 4 diagonal directions\n' +
            '• Win by capturing all opponent pieces or blocking them'
          )
        }}
      >
        <HelpCircle size={16} />
        Rules
      </button>
    </div>
  )
}
