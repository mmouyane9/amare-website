import { useCallback, useEffect, useRef, useState } from 'react'

export function useSaveFeedback() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const timer = useRef<number | null>(null)

  const complete = useCallback(() => {
    setSaving(false)
    setSaved(true)
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setSaved(false), 2500)
  }, [])

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [])

  return { saving, saved, setSaving, complete }
}
