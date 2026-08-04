import { Bell, Search } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  title: string
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'
}

function formatRole(role: string | null): string {
  if (!role) return 'User'
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuth()

  const displayName = user?.name ?? 'Admin'
  const email = user?.email ?? ''
  const role = user?.role ?? null
  const initials = getInitials(displayName)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-background/95 px-4 shadow-[0_1px_0_0_rgba(0,0,0,0.02)] backdrop-blur lg:px-6">
      <div className="flex min-w-0 flex-col">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{displayName}</span>
          <span aria-hidden>·</span>
          <span className="font-semibold text-foreground">{title}</span>
        </nav>
        <h1 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="h-9 w-60 rounded-lg border-border/60 bg-muted/50 pl-9 focus-visible:bg-background lg:w-64"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4.5" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
        </Button>

        <div className="flex items-center gap-2.5">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col leading-tight lg:flex">
            <span className="text-sm font-medium text-foreground" title={email}>
              {displayName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatRole(role)}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
