import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link as LinkIcon, Eye, EyeOff, Columns } from 'lucide-react'
import type { FooterStats } from '@/types/footer'

interface Props {
  stats: FooterStats
}

export default function FooterStatsCards({ stats }: Props) {
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            إجمالي الروابط
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <LinkIcon className="size-5" />
            </span>
            <span className="text-2xl font-bold">{stats.totalItems}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            الروابط الظاهرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Eye className="size-5" />
            </span>
            <span className="text-2xl font-bold">{stats.visibleItems}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            الروابط المخفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <EyeOff className="size-5" />
            </span>
            <span className="text-2xl font-bold">{stats.hiddenItems}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            عدد الأعمدة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Columns className="size-5" />
            </span>
            <span className="text-2xl font-bold">{stats.columnCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
