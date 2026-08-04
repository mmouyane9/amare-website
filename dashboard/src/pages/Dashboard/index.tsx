import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  FileEdit,
  Globe,
  Landmark,
  Newspaper,
  Package,
  Store,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
  getDashboardStats,
  getRecentActivity,
  type ActivityLogEntry,
  type DashboardStats,
} from '@/services/dashboard.service'

interface StatDefinition {
  label: string
  icon: LucideIcon
  accent: string
  key: keyof DashboardStats
}

const STAT_DEFINITIONS: StatDefinition[] = [
  {
    label: 'Total Members',
    icon: Users,
    accent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    key: 'totalMembers',
  },
  {
    label: 'Active Branches',
    icon: Landmark,
    accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    key: 'activeBranches',
  },
  {
    label: 'Published News',
    icon: Newspaper,
    accent: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    key: 'publishedNews',
  },
  {
    label: 'Active Updates',
    icon: Bell,
    accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    key: 'activeUpdates',
  },
  {
    label: 'Store Products',
    icon: Package,
    accent: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    key: 'storeProducts',
  },
]

interface QuickAction {
  label: string
  description: string
  icon: LucideIcon
  path: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Content Editor',
    description: 'Manage website pages',
    icon: FileEdit,
    path: '/content-editor',
  },
  {
    label: 'Members',
    description: 'View & manage members',
    icon: UserPlus,
    path: '/members',
  },
  {
    label: 'News',
    description: 'Manage news articles',
    icon: Newspaper,
    path: '/news',
  },
  {
    label: 'Updates',
    description: 'Publish updates',
    icon: Bell,
    path: '/updates',
  },
  {
    label: 'AMARE Store',
    description: 'Manage store products',
    icon: Store,
    path: '/store',
  },
]

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function mapEntityTypeToIcon(entityType: string | null): LucideIcon {
  switch (entityType) {
    case 'news':
      return Newspaper
    case 'member':
    case 'members':
      return Users
    case 'branch':
    case 'branches':
      return Landmark
    case 'update':
    case 'updates':
      return Bell
    case 'product':
    case 'store_products':
      return Package
    default:
      return Bell
  }
}

const ENTITY_ACCENT_MAP: Record<string, string> = {
  news: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  members: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  member: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  branches: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  branch: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  updates: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  update: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  store_products: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  product: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
}

function StatCardSkeleton() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardAction>
          <span className="flex size-9 animate-pulse rounded-lg bg-muted" />
        </CardAction>
        <CardDescription>
          <span className="block h-3 w-20 animate-pulse rounded bg-muted" />
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          <span className="block h-7 w-12 animate-pulse rounded bg-muted" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        <span className="block h-3 w-24 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}

function ActivitySkeleton() {
  return (
    <div className="divide-y divide-border/60">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-3.5 first:pt-1 last:pb-0">
          <span className="mt-0.5 flex size-8 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="block h-4 w-32 animate-pulse rounded bg-muted" />
            <span className="block h-3 w-48 animate-pulse rounded bg-muted" />
          </div>
          <span className="block h-3 w-12 shrink-0 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<ActivityLogEntry[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [activitiesLoading, setActivitiesLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const [statsData, activityData] = await Promise.all([
          getDashboardStats(),
          getRecentActivity(),
        ])
        if (cancelled) return
        setStats(statsData)
        setActivities(activityData)
      } catch {
        if (cancelled) return
        toast.error('Unable to load dashboard data. Please try again.')
      } finally {
        if (!cancelled) {
          setStatsLoading(false)
          setActivitiesLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [])

  const displayName = user?.name ?? 'Admin'

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back, {displayName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with the association today.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {statsLoading
          ? STAT_DEFINITIONS.map((def) => (
              <StatCardSkeleton key={def.key} />
            ))
          : STAT_DEFINITIONS.map(({ label, icon: Icon, accent, key }) => {
              const value = stats?.[key] ?? 0
              return (
                <Card key={key} size="sm">
                  <CardHeader>
                    <CardAction>
                      <span
                        className={cn(
                          'flex size-9 items-center justify-center rounded-lg',
                          accent,
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                    </CardAction>
                    <CardDescription>{label}</CardDescription>
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                      {value.toLocaleString()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <p className="text-xs text-muted-foreground">
                      {value === 0 && 'No records yet'}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates across the association
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            {activitiesLoading ? (
              <ActivitySkeleton />
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Globe className="size-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  No recent activity.
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Activity will appear here as actions are performed.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {activities.map((entry) => {
                  const IconComponent = mapEntityTypeToIcon(entry.entity_type)

                  const accent =
                    ENTITY_ACCENT_MAP[entry.entity_type ?? ''] ??
                    'bg-muted text-muted-foreground'

                  return (
                    <li
                      key={entry.id}
                      className="flex items-start gap-3 py-3.5 first:pt-1 last:pb-0"
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
                          accent,
                        )}
                      >
                        <IconComponent className="size-4" />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {entry.action ?? 'Activity'}
                        </span>
                        <span className="mt-0.5 text-sm text-muted-foreground">
                          {entry.description ?? 'No description'}
                        </span>
                      </div>
                      <time className="shrink-0 text-xs text-muted-foreground">
                        {formatRelativeTime(entry.created_at)}
                      </time>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {QUICK_ACTIONS.map(({ label, description, icon: Icon, path }) => (
              <Button
                key={path}
                variant="outline"
                className="h-auto w-full justify-start gap-3 rounded-lg px-3 py-3"
                onClick={() => navigate(path)}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="flex min-w-0 flex-col items-start text-left">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-xs text-muted-foreground">
                    {description}
                  </span>
                </span>
                <ArrowRight className="ml-auto size-4 text-muted-foreground" />
              </Button>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
