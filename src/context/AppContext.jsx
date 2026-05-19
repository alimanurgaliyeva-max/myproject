import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getLevelInfo } from '../utils/xpSystem'
import { checkNewAchievements } from '../utils/achievements'
import { useAuth } from './AuthContext'
import { supabase } from '../utils/supabase'

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
  const { user } = useAuth()
  const [profile, setProfile] = useLocalStorage('dama-profile-v2', DEFAULT_PROFILE)
  const [history, setHistory] = useLocalStorage('dama-history-v2', [])
  const [notifications, setNotifications] = useState([])

  // Prevents the save effect from firing during Supabase load
  const suppressSaveRef = useRef(false)
  const wasLoggedInRef = useRef(false)

  const levelInfo = getLevelInfo(profile.totalXP)

  // Load from Supabase on login; reset to defaults on logout
  useEffect(() => {
    if (!user) {
      if (wasLoggedInRef.current) {
        wasLoggedInRef.current = false
        setProfile(DEFAULT_PROFILE)
      }
      return
    }

    wasLoggedInRef.current = true
    suppressSaveRef.current = true

    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        const metaUsername = user.user_metadata?.username
        if (data) {
          setProfile(p => ({
            ...p,
            username: data.username ?? metaUsername ?? p.username,
            elo: data.elo ?? p.elo,
            totalXP: data.xp ?? p.totalXP,
            wins: data.wins ?? p.wins,
            losses: data.losses ?? p.losses,
            achievements: data.achievements ?? p.achievements,
            dailyStreak: data.daily_streak ?? p.dailyStreak,
            coins: data.coins ?? p.coins,
            level: getLevelInfo(data.xp ?? p.totalXP).level,
          }))
        } else if (metaUsername) {
          // Profile row doesn't exist yet (race on signup) — use auth metadata
          setProfile(p => ({ ...p, username: metaUsername }))
        }
        // Let React process the state update before re-enabling saves
        setTimeout(() => { suppressSaveRef.current = false }, 600)
      })
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save to Supabase when key fields change (debounced 1.5s)
  useEffect(() => {
    if (!user || suppressSaveRef.current) return
    const timeout = setTimeout(() => {
      if (suppressSaveRef.current) return
      supabase.from('profiles').upsert({
        id: user.id,
        username: profile.username,
        elo: profile.elo,
        xp: profile.totalXP,
        wins: profile.wins,
        losses: profile.losses,
        achievements: profile.achievements,
        daily_streak: profile.dailyStreak,
        coins: profile.coins,
      })
    }, 1500)
    return () => clearTimeout(timeout)
  }, [
    user,
    profile.username,
    profile.elo,
    profile.totalXP,
    profile.wins,
    profile.losses,
    profile.achievements,
    profile.dailyStreak,
    profile.coins,
  ])

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
      const updated = {
        ...p,
        gamesPlayed: p.gamesPlayed + 1,
        wins: won ? p.wins + 1 : p.wins,
        losses: won ? p.losses : p.losses + 1,
        winStreak: newStreak,
        bestStreak: Math.max(p.bestStreak, newStreak),
      }
      // Sync to Supabase immediately so the leaderboard reflects latest stats
      if (user) {
        supabase.from('profiles').upsert({
          id: user.id,
          username: updated.username,
          elo: updated.elo,
          xp: updated.totalXP,
          wins: updated.wins,
          losses: updated.losses,
          achievements: updated.achievements,
          daily_streak: updated.dailyStreak,
          coins: updated.coins,
        })
      }
      return updated
    })
    setHistory(h => [{
      id: Date.now(),
      date: new Date().toISOString(),
      mode, difficulty, won, capturedByOpponent, moveCount, usedHints,
    }, ...h].slice(0, 100))
  }, [user, setProfile, setHistory])

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
