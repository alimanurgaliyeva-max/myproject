import { useApp } from '../context/AppContext'
import { X } from 'lucide-react'

const COLORS = {
  achievement: 'border-[#f1a208] bg-[#fffbf0] dark:bg-[#1a1500]',
  level:       'border-[#6c63ff] bg-[#f8f7ff] dark:bg-[#0f0e1a]',
  xp:          'border-[#22c55e] bg-[#f0fdf4] dark:bg-[#0a1a0f]',
}

const ICONS = {
  achievement: '🏆',
  level: '⬆️',
  xp: '⚡',
}

export default function AchievementToast() {
  const { notifications, dismissNotification } = useApp()
  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-xs w-full">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-heavy animate-slide-up ${COLORS[n.type] ?? COLORS.xp}`}
        >
          <span className="text-xl flex-shrink-0">{ICONS[n.type] ?? '✨'}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-[#1a1a1a] dark:text-white">{n.title}</p>
            {n.body && <p className="text-xs text-[#666] dark:text-[#b0b0b0] mt-0.5">{n.body}</p>}
          </div>
          <button onClick={() => dismissNotification(n.id)} className="flex-shrink-0 text-[#999] hover:text-[#666] dark:hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
