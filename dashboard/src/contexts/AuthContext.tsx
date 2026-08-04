import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

export type AuthRole = 'super_admin' | 'admin' | 'editor' | 'moderator'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: AuthRole | null
}

interface AuthContextValue {
  isAuthenticated: boolean
  user: AuthUser | null
  authLoading: boolean
  login: (supabaseUser: User, remember?: boolean) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface ProfileRow {
  role: string
  full_name: string | null
  email: string | null
}

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

function isValidRole(role: string): role is AuthRole {
  return ['super_admin', 'admin', 'editor', 'moderator'].includes(role)
}

function mapSupabaseUser(
  supabaseUser: User,
  profile?: ProfileRow | null,
): AuthUser {
  return {
    id: supabaseUser.id,
    name:
      profile?.full_name ??
      supabaseUser.user_metadata?.full_name ??
      supabaseUser.email?.split('@')[0] ??
      'User',
    email: profile?.email ?? supabaseUser.email ?? '',
    role: profile?.role && isValidRole(profile.role) ? profile.role : null,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function initAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (cancelled) return

      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (!cancelled) {
          setUser(mapSupabaseUser(session.user, profile))
        }
      }

      if (!cancelled) {
        setAuthLoading(false)
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return

      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (!cancelled) {
          setUser(mapSupabaseUser(session.user, profile))
        }
      } else {
        setUser(null)
      }

      if (!cancelled) {
        setAuthLoading(false)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(
    async (supabaseUser: User, _remember = false) => {
      const profile = await fetchProfile(supabaseUser.id)
      setUser(mapSupabaseUser(supabaseUser, profile))
    },
    [],
  )

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: user !== null,
      user,
      authLoading,
      login,
      logout,
    }),
    [user, authLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
