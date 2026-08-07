import { useState } from 'react'

import { Administrators } from '@/pages/ControlPanel/components/Administrators'
import { Branding } from '@/pages/ControlPanel/components/Branding'
import { GeneralSettings } from '@/pages/ControlPanel/components/GeneralSettings'
import { SocialMedia } from '@/pages/ControlPanel/components/SocialMedia'
import { CONTROL_SECTIONS } from '@/pages/ControlPanel/sections'
import { cn } from '@/lib/utils'

export default function ControlPanelPage() {
  const [active, setActive] = useState('general')

  const renderSection = () => {
    switch (active) {
      case 'general':
        return <GeneralSettings />
      case 'social':
        return <SocialMedia />
      case 'administrators':
        return <Administrators />
      case 'branding':
        return <Branding />
      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          لوحة الإعدادات
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          إدارة إعدادات الجمعية والمسؤولين والعلامة التجارية.
        </p>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {CONTROL_SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
              active === id
                ? 'border-border bg-muted/70 text-foreground shadow-sm'
                : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav className="hidden lg:block">
          <ul className="sticky top-0 space-y-1">
            {CONTROL_SECTIONS.map(({ id, label, description, icon: Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setActive(id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                    active === id
                      ? 'border-border bg-muted/70 shadow-sm'
                      : 'border-transparent hover:bg-muted/50',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md ring-1 ring-border transition-colors',
                      active === id
                        ? 'bg-primary/10 text-primary'
                        : 'bg-background text-muted-foreground',
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        'block text-sm font-medium',
                        active === id ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {label}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {description}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">{renderSection()}</div>
      </div>
    </div>
  )
}
