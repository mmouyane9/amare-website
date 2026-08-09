import { ExternalLink, LockKeyhole } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { SystemManagedPage } from '@/data/systemManagedPages'

interface ReadOnlyPagePanelProps {
  info: SystemManagedPage
}

export function ReadOnlyPagePanel({ info }: ReadOnlyPagePanelProps) {
  const navigate = useNavigate()

  return (
    <div className="flex h-full items-center justify-center bg-gray-50/60 p-6">
      <Card className="w-full max-w-md p-8 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
          <LockKeyhole className="size-8" />
        </span>
        <h2 className="mt-5 text-lg font-semibold text-foreground">
          هذه الصفحة غير قابلة للتعديل
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{info.message}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {info.secondaryMessage}
        </p>
        {info.route && (
          <Button
            type="button"
            onClick={() => navigate(info.route!)}
            className="mt-7 w-full gap-2"
          >
            الانتقال إلى {info.manageLabel}
            <ExternalLink className="size-4" />
          </Button>
        )}
      </Card>
    </div>
  )
}
