import { PLAYER } from '../utils/constants'

export default function GameTimer({ redTime, blackTime, currentPlayer, formatTime, timerMode }) {
  if (timerMode === 'none' || redTime === null) return null

  return (
    <div className="card p-0 overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-[#e0e0e0] dark:divide-[#333]">
        {[
          { player: PLAYER.RED, time: redTime, label: 'Red' },
          { player: PLAYER.BLACK, time: blackTime, label: 'Black' },
        ].map(({ player, time, label }) => {
          const active = currentPlayer === player
          const low = time !== null && time < 30
          return (
            <div key={player} className={`flex flex-col items-center py-3 px-4 transition-colors duration-200 ${active ? 'bg-[#f1a208]/5 dark:bg-[#ffd700]/5' : ''}`}>
              <span className="text-[10px] uppercase tracking-wider text-[#999] dark:text-[#555] mb-1">{label}</span>
              <span className={`text-xl font-bold font-mono tabular-nums transition-colors duration-200 ${active ? 'text-[#1a1a1a] dark:text-white' : 'text-[#999] dark:text-[#555]'} ${low ? 'text-[#e63946] animate-pulse' : ''}`}>
                {formatTime(time)}
              </span>
              {active && <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#f1a208] dark:bg-[#ffd700]" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
