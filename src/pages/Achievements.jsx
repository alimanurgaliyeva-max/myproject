import { Link } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ACHIEVEMENTS } from '../utils/achievements'

function AchievementCard({ achievement, unlocked }) {
  return (
    <div className={`card flex items-start gap-4 transition-all duration-200 ${unlocked ? '' : 'opacity-50'}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl border-2 ${
        unlocked ? 'border-[#f1a208]/30 bg-[#f1a208]/5' : 'border-[#e0e0e0] dark:border-[#333] bg-[#f5f5f5] dark:bg-[#111]'
      }`}>
        {unlocked ? achievement.emoji : <Lock size={20} className="text-[#ccc] dark:text-[#444]" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-sm">{achievement.name}</p>
          {unlocked && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f1a208]/10 text-[#f1a208] flex-shrink-0">
              +{achievement.xp} XP
            </span>
          )}
        </div>
        <p className="text-xs text-[#666] dark:text-[#b0b0b0] mt-0.5 leading-relaxed">{achievement.description}</p>
        {unlocked && (
          <p className="text-[10px] text-[#22c55e] mt-1.5 font-semibold">✓ Unlocked</p>
        )}
      </div>
    </div>
  )
}

export default function Achievements() {
  const { profile } = useApp()
  const unlockedIds = profile.achievements ?? []
  const unlockedCount = unlockedIds.length
  const progress = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)

  return (
    <div className="min-h-screen pt-[70px] animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="btn-ghost gap-2 text-sm"><ArrowLeft size={15} />Back</Link>
          <div>
            <h1 className="text-2xl font-bold">Achievements</h1>
            <p className="text-sm text-[#666] dark:text-[#b0b0b0]">{unlockedCount} of {ACHIEVEMENTS.length} unlocked</p>
          </div>
        </div>

        {/* Progress */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold">Overall Progress</p>
            <p className="font-bold text-[#f1a208]">{progress}%</p>
          </div>
          <div className="w-full h-3 rounded-full bg-[#e0e0e0] dark:bg-[#333]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#f1a208] to-[#ffd700] transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#999] dark:text-[#555] mt-2">
            <span>{unlockedCount} unlocked</span>
            <span>{ACHIEVEMENTS.length - unlockedCount} remaining</span>
          </div>
        </div>

        {/* Unlocked */}
        {unlockedCount > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#999] dark:text-[#555] mb-3">Unlocked</h2>
            <div className="flex flex-col gap-3">
              {ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id)).map(a => (
                <AchievementCard key={a.id} achievement={a} unlocked />
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#999] dark:text-[#555] mb-3">Locked</h2>
          <div className="flex flex-col gap-3">
            {ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id)).map(a => (
              <AchievementCard key={a.id} achievement={a} unlocked={false} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
