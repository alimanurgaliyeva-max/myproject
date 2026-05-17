import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getLevelInfo } from '../utils/xpSystem'
import { checkNewAchievements, ACHIEVEMENTS } from '../utils/achievements'

const Ctx = createContext(null)

const DEFAULT_PROFILE = {
  username: 'Player',
  avatar: 0,
  totalXP: 0,
  level: 1,
  elo: 1600,
  eloHistory: [],
  coins: 0,
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  winStreak: 0,
  bestStreak: 0,
  totalCaptures: 0,
  achievements: [],
  dailyStreak: 0,
  lastDailyDate: null,
  dailyCompletions: {},
  boardTheme: 'classic',
  coachEnabled: true,
  hintLevel: 2,
  showValidMoves: true,
  showLastMove: true,
  soundEnabled: true,
}

export function AppProvider({ children }) {
  const [profile, setProfile] = useLocalStorage('dama-profile-v2', DEFAULT_PROFILE)
  const [history, setHistory] = useLocalStorage('dama-history-v2', [])
  const [notifications, setNotifications] = useState([])

  // Keep level/title in sync
  const levelInfo = getLevelInfo(profile.totalXP)

  const updateProfile = useCallback((updates) => {
    setProfile(p => ({ ...p, ...updates }))
  }, [setProfile])

  const addNotification = useCallback((notif) => {
    const id = Date.now() + Math.random()
    setNotifications(n => [...n, { ...notif, id }])
    setTimeout(() => setNotifications(n => n.filter(x => x.id !== id)), 4000)
  }, [])

  const addXP = useCallback((amount, label = '') => {
    setProfile(p => {
      const newXP = p.totalXP + amount
      const newInfo = getLevelInfo(newXP)
      const oldInfo = getLevelInfo(p.totalXP)
      if (newInfo.level > oldInfo.level) {
        setTimeout(() => addNotification({
          type: 'level',
          title: `Level Up! 🎉`,
          body: `You reached Level ${newInfo.level} — ${newInfo.title}!`,
        }), 500)
      }
      return { ...p, totalXP: newXP, level: newInfo.level }
    })
    if (amount > 0 && label) {
      setTimeout(() => addNotification({ type: 'xp', title: `+${amount} XP`, body: label }), 200)
    }
  }, [setProfile, addNotification])

  const addCoins = useCallback((amount) => {
    setProfile(p => ({ ...p, coins: p.coins + amount }))
  }, [setProfile])

  const updateElo = useCallback((newElo) => {
    setProfile(p => ({
      ...p,
      elo: newElo,
      eloHistory: [...(p.eloHistory ?? []).slice(-49), { date: Date.now(), elo: newElo }],
    }))
  }, [setProfile])

  const checkAndUnlockAchievements = useCallback((event) => {
    setProfile(p => {
      const levelInfo = getLevelInfo(p.totalXP)
      const profileWithLevel = { ...p, level: levelInfo.level }
      const newlyUnlocked = checkNewAchievements(profileWithLevel, event, p.achievements)
      if (newlyUnlocked.length === 0) return p
      let totalXP = p.totalXP
      let coins = p.coins
      for (const ach of newlyUnlocked) {
        totalXP += ach.xp
        coins += ach.coins
        setTimeout(() => addNotification({
          type: 'achievement',
          title: `Achievement Unlocked! ${ach.emoji}`,
          body: ach.name,
        }), 800)
      }
      return {
        ...p,
        totalXP,
        coins,
        achievements: [...p.achievements, ...newlyUnlocked.map(a => a.id)],
        level: getLevelInfo(totalXP).level,
      }
    })
  }, [setProfile, addNotification])

  const recordGame = useCallback(({ won, difficulty, mode, capturedByOpponent, moveCount, usedHints }) => {
    setProfile(p => {
      const newStreak = won ? p.winStreak + 1 : 0
      return {
        ...p,
        gamesPlayed: p.gamesPlayed + 1,
        wins: won ? p.wins + 1 : p.wins,
        losses: won ? p.losses : p.losses + 1,
        winStreak: newStreak,
        bestStreak: Math.max(p.bestStreak, newStreak),
      }
    })
    setHistory(h => [{
      id: Date.now(),
      date: new Date().toISOString(),
      mode, difficulty, won, capturedByOpponent, moveCount, usedHints,
    }, ...h].slice(0, 100))
  }, [setProfile, setHistory])

  const recordDailyChallenge = useCallback((difficulty) => {
    const today = new Date().toDateString()
    setProfile(p => {
      const prev = p.dailyCompletions ?? {}
      const todayMap = { ...(prev[today] ?? {}) }
      todayMap[difficulty] = true
      const isNewDay = p.lastDailyDate !== today
      const newStreak = isNewDay ? p.dailyStreak + 1 : p.dailyStreak
      return {
        ...p,
        lastDailyDate: today,
        dailyStreak: newStreak,
        dailyCompletions: { ...prev, [today]: todayMap },
      }
    })
  }, [setProfile])

  const dismissNotification = useCallback((id) => {
    setNotifications(n => n.filter(x => x.id !== id))
  }, [])

  const value = {
    profile: { ...profile, ...levelInfo },
    history,
    notifications,
    addXP,
    addCoins,
    updateElo,
    updateProfile,
    recordGame,
    recordDailyChallenge,
    checkAndUnlockAchievements,
    addNotification,
    dismissNotification,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
