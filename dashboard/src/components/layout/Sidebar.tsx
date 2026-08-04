import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Sparkles } from 'lucide-react'

import { NAV_ITEMS } from '@/components/layout/nav-items'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar lg:flex">
      <div className="flex h-16 shrink-0 items-center gap-3 px-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
          <Sparkles className="size-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
            AMARE
          </span>
          <span className="text-xs text-muted-foreground">Admin Panel</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Menu
        </p>
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-opacity duration-150',
                      isActive ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <Icon
                    className={cn(
                      'size-4.5 shrink-0 transition-colors',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-sidebar-foreground',
                    )}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-border/60" />

      <div className="px-3 py-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-all duration-150 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4.5 shrink-0" />
          Logout
        </button>
      </div>

      <div className="border-t border-border/60 px-5 py-4">
        <p className="text-xs text-muted-foreground">AMARE Admin · v1.0.0</p>
      </div>
    </aside>
  )
}
