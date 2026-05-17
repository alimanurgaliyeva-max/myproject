import { useState, useCallback } from 'react'
import { getCoachHint } from '../utils/aiCoach'
import { PLAYER } from '../utils/constants'

export function useAICoach(enabled, hintLevel = 2) {
  const [hint, setHint] = useState(null)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [loading, setLoading] = useState(false)

  const requestHint = useCallback((board, player) => {
    if (!enabled || player !== PLAYER.RED) return
    setLoading(true)
    // Run async so it doesn't block rendering
    setTimeout(() => {
      const result = getCoachHint(board, player, hintLevel)
      setHint(result)
      setHintsUsed(c => c + 1)
      setLoading(false)
    }, 0)
  }, [enabled, hintLevel])

  const clearHint = useCallback(() => setHint(null), [])
  const resetCoach = useCallback(() => { setHint(null); setHintsUsed(0) }, [])

  return { hint, hintsUsed, loading, requestHint, clearHint, resetCoach }
}
