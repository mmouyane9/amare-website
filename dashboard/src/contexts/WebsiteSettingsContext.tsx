import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings'
import type { WebsiteSettings } from '@/services/settingsService'

interface WebsiteSettingsContextValue {
  settings: WebsiteSettings | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const WebsiteSettingsContext = createContext<
  WebsiteSettingsContextValue | undefined
>(undefined)

export function WebsiteSettingsProvider({ children }: { children: ReactNode }) {
  const { settings, loading, error, refresh } = useWebsiteSettings()

  useEffect(() => {
    const faviconUrl = settings?.favicon_url
    if (faviconUrl) {
      const link = document.getElementById('amare-favicon') as HTMLLinkElement | null
      if (link) {
        link.href = faviconUrl
      } else {
        const newLink = document.createElement('link')
        newLink.id = 'amare-favicon'
        newLink.rel = 'icon'
        newLink.href = faviconUrl
        document.head.appendChild(newLink)
      }
    }
  }, [settings?.favicon_url])

  const value = useMemo(
    () => ({ settings, loading, error, refresh }),
    [settings, loading, error, refresh],
  )

  return (
    <WebsiteSettingsContext.Provider value={value}>
      {children}
    </WebsiteSettingsContext.Provider>
  )
}

export function useWebsiteSettingsContext(): WebsiteSettingsContextValue {
  const context = useContext(WebsiteSettingsContext)
  if (!context) {
    throw new Error(
      'useWebsiteSettingsContext must be used within a WebsiteSettingsProvider',
    )
  }
  return context
}
