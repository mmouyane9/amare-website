import { NavLink, useNavigate } from 'react-router-dom'
import { Globe, LogOut } from 'lucide-react'

import { NAV_ITEMS } from '@/components/layout/nav-items'
import { useAuth } from '@/contexts/AuthContext'
import { useWebsiteSettingsContext } from '@/contexts/WebsiteSettingsContext'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { logout } = useAuth()
  const { settings } = useWebsiteSettingsContext()
  const navigate = useNavigate()

  const displayName = settings?.short_name || 'AMARE'
  const logoUrl = settings?.logo_url || '/logo.png'

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-l border-border/60 bg-sidebar lg:flex">
      <div className="flex h-16 shrink-0 items-center gap-3 px-5">
        <img src={logoUrl} alt={displayName} className="size-10 rounded-lg object-contain" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground">لوحة الإدارة</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          القائمة
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
                      'absolute top-1/2 right-0 h-5 w-1 -translate-y-1/2 rounded-l-full bg-primary transition-opacity duration-150',
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
        <a
          href="https://www.amare.ma/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-all duration-150 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        >
          <Globe className="size-4.5 shrink-0" />
          عرض الموقع
        </a>
      </div>

      <div className="border-t border-border/60" />

      <div className="px-3 py-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-all duration-150 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4.5 shrink-0" />
          تسجيل الخروج
        </button>
      </div>

      <div className="border-t border-border/60 px-5 py-4">
        <p className="text-xs text-muted-foreground">{displayName} للإدارة · v1.0.0</p>
      </div>
    </aside>
  )
}
