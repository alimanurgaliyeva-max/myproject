import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Edit2, Check, Trophy, Zap, Shield, Volume2, VolumeX } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ACHIEVEMENTS } from '../utils/achievements'
import { getEloTier } from '../utils/eloSystem'
import { BOARD_THEMES } from '../utils/constants'

const AVATARS = ['🧑', '👩', '🧔', '👩‍🦱', '🧑‍💻', '👨‍🎓', '🦊', '🐯', '🦁', '🐺', '🤖', '👑']

function ProfileAvatar({ avatar, size = 'lg' }) {
  const s = size === 'lg' ? 'w-20 h-20 text-4xl' : 'w-10 h-10 text-xl'
  return (
    <div className={`${s} rounded-2xl bg-[#f1a208]/10 dark:bg-[#ffd700]/10 flex items-center justify-center border-2 border-[#f1a208]/30`}>
      {AVATARS[avatar ?? 0]}
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#e0e0e0] dark:border-[#333] last:border-0">
      <span className="text-sm text-[#666] dark:text-[#b0b0b0]">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  )
}

export default function Profile() {
  const { profile, updateProfile } = useApp()
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState(profile.username)
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar ?? 0)
  const [selectedTheme, setSelectedTheme] = useState(profile.boardTheme ?? 'classic')

  const save = () => {
    updateProfile({ username: username.trim() || 'Player', avatar: selectedAvatar, boardTheme: selectedTheme })
    setEditing(false)
  }

  const unlockedCount = profile.achievements.length
  const winRate = profile.gamesPlayed > 0 ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0

  return (
    <div className="min-h-screen pt-[70px] animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="btn-ghost gap-2 text-sm"><ArrowLeft size={15} />Back</Link>
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="card flex flex-col items-center gap-4 text-center">
              <ProfileAvatar avatar={editing ? selectedAvatar : profile.avatar} />
              {editing ? (
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  maxLength={20}
                  className="w-full text-center font-bold text-lg border border-[#e0e0e0] dark:border-[#333] rounded-lg px-3 py-2 bg-transparent focus:outline-none focus:border-[#f1a208]"
                />
              ) : (
                <div>
                  <p className="font-bold text-xl">{profile.username}</p>
                  <p className="text-sm text-[#666] dark:text-[#b0b0b0]">{profile.title} · Level {profile.level}</p>
                </div>
              )}

              {/* XP bar */}
              <div className="w-full">
                <div className="flex justify-between text-xs text-[#999] dark:text-[#555] mb-1">
                  <span>{profile.xpInLevel} XP</span>
                  <span>{profile.xpToNext} XP</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e0e0e0] dark:bg-[#333]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#f1a208] to-[#ffd700]" style={{ width: `${Math.round((profile.progress ?? 0) * 100)}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full text-center">
                <div className="bg-[#f5f5f5] dark:bg-[#111] rounded-xl py-2">
                  <p className="text-lg font-bold text-[#f1a208]">{profile.elo}</p>
                  <p className="text-[10px] text-[#999] dark:text-[#555] uppercase tracking-wider">Elo</p>
                </div>
                <div className="bg-[#f5f5f5] dark:bg-[#111] rounded-xl py-2">
                  <p className="text-lg font-bold">{profile.coins}</p>
                  <p className="text-[10px] text-[#999] dark:text-[#555] uppercase tracking-wider">Coins</p>
                </div>
              </div>

              {editing ? (
                <button onClick={save} className="btn-primary w-full justify-center gap-2 text-sm py-2.5">
                  <Check size={15} />Save Changes
                </button>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-secondary w-full justify-center gap-2 text-sm py-2.5">
                  <Edit2 size={15} />Edit Profile
                </button>
              )}
            </div>

            {/* Elo tier */}
            <div className="card text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] dark:text-[#555] mb-2">Rating Tier</p>
              <p className="text-3xl font-bold text-[#6c63ff]">{profile.elo}</p>
              <p className="text-sm text-[#666] dark:text-[#b0b0b0] mt-1">{getEloTier(profile.elo)}</p>
            </div>
          </div>

          {/* Right column */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {/* Stats */}
            <div className="card">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Trophy size={16} className="text-[#f1a208]" />Career Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8">
                <div>
                  <StatRow label="Games Played" value={profile.gamesPlayed} />
                  <StatRow label="Wins" value={profile.wins} />
                  <StatRow label="Losses" value={profile.losses} />
                  <StatRow label="Win Rate" value={`${winRate}%`} />
                </div>
                <div>
                  <StatRow label="Win Streak" value={profile.winStreak} />
                  <StatRow label="Best Streak" value={profile.bestStreak} />
                  <StatRow label="Daily Streak" value={`${profile.dailyStreak} days`} />
                  <StatRow label="Total XP" value={profile.totalXP.toLocaleString()} />
                </div>
              </div>
            </div>

            {/* Avatar picker (editing only) */}
            {editing && (
              <div className="card">
                <h3 className="font-bold mb-4">Choose Avatar</h3>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((av, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedAvatar(i)}
                      className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center border-2 transition-all duration-150 ${
                        selectedAvatar === i ? 'border-[#f1a208] bg-[#f1a208]/10' : 'border-[#e0e0e0] dark:border-[#333] hover:border-[#f1a208]/50'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Board themes */}
            <div className="card">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Shield size={16} className="text-[#6c63ff]" />Board Theme</h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(BOARD_THEMES).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedTheme(key); updateProfile({ boardTheme: key }) }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-150 ${
                      (editing ? selectedTheme : profile.boardTheme) === key ? 'border-[#f1a208]' : 'border-[#e0e0e0] dark:border-[#333] hover:border-[#f1a208]/50'
                    }`}
                  >
                    <div className="grid grid-cols-4 rounded overflow-hidden w-full h-8">
                      {Array(8).fill(null).map((_, i) => (
                        <div key={i} style={{ backgroundColor: i % 2 === 0 ? theme.light : theme.dark }} />
                      ))}
                    </div>
                    <span className="text-xs font-semibold">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="card">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                {profile.soundEnabled !== false ? <Volume2 size={16} className="text-[#f1a208]" /> : <VolumeX size={16} className="text-[#999]" />}
                Preferences
              </h3>
              <div className="flex items-center justify-between py-3 border-b border-[#e0e0e0] dark:border-[#333]">
                <div>
                  <p className="text-sm font-semibold">Sound Effects</p>
                  <p className="text-xs text-[#666] dark:text-[#b0b0b0] mt-0.5">Move whoosh &amp; capture sounds</p>
                </div>
                <button
                  onClick={() => updateProfile({ soundEnabled: profile.soundEnabled === false })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${profile.soundEnabled !== false ? 'bg-[#f1a208]' : 'bg-[#e0e0e0] dark:bg-[#333]'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${profile.soundEnabled !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            {/* Achievements preview */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2"><Zap size={16} className="text-[#f1a208]" />Achievements</h3>
                <Link to="/achievements" className="text-xs text-[#f1a208] hover:underline">{unlockedCount}/{ACHIEVEMENTS.length} unlocked →</Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {ACHIEVEMENTS.slice(0, 8).map(a => (
                  <div key={a.id} title={a.name} className={`w-10 h-10 rounded-xl text-2xl flex items-center justify-center border-2 transition-all duration-200 ${
                    profile.achievements.includes(a.id) ? 'border-[#f1a208]/40 bg-[#f1a208]/5' : 'border-[#e0e0e0] dark:border-[#333] grayscale opacity-30'
                  }`}>
                    {a.emoji}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
