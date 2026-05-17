import { useState, useEffect, useRef, useCallback } from 'react'
import { PLAYER, TIMER_MODES, TIMER_SETTINGS } from '../utils/constants'

export function useGameTimer(timerMode, currentPlayer, gameActive) {
  const settings = TIMER_SETTINGS[timerMode]
  const initialSeconds = settings?.seconds ?? null

  const [redTime, setRedTime] = useState(initialSeconds)
  const [blackTime, setBlackTime] = useState(initialSeconds)
  const [timedOut, setTimedOut] = useState(null) // PLAYER who ran out of time
  const intervalRef = useRef(null)

  const resetTimer = useCallback(() => {
    setRedTime(initialSeconds)
    setBlackTime(initialSeconds)
    setTimedOut(null)
  }, [initialSeconds])

  useEffect(() => {
    if (!gameActive || timerMode === TIMER_MODES.NONE || !initialSeconds) return
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (currentPlayer === PLAYER.RED) {
        setRedTime(t => {
          if (t <= 1) { setTimedOut(PLAYER.RED); clearInterval(intervalRef.current); return 0 }
          return t - 1
        })
      } else {
        setBlackTime(t => {
          if (t <= 1) { setTimedOut(PLAYER.BLACK); clearInterval(intervalRef.current); return 0 }
          return t - 1
        })
      }
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [currentPlayer, gameActive, timerMode, initialSeconds])

  const formatTime = (seconds) => {
    if (seconds === null) return '∞'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return { redTime, blackTime, timedOut, resetTimer, formatTime }
}
