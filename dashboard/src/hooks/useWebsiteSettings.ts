import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getWebsiteSettings,
  subscribeToWebsiteSettings,
  type WebsiteSettings,
} from '@/services/settingsService'

interface UseWebsiteSettingsReturn {
  settings: WebsiteSettings | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useWebsiteSettings(): UseWebsiteSettingsReturn {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const refresh = useCallback(async () => {
    try {
      const data = await getWebsiteSettings()
      setSettings(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()

    unsubscribeRef.current = subscribeToWebsiteSettings((updated) => {
      setSettings(updated)
    })

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [refresh])

  return { settings, loading, error, refresh }
}
