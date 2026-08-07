import { ShieldOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export default function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 ring-1 ring-destructive/20">
        <ShieldOff className="size-8 text-destructive" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">تم رفض الوصول</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          ليس لديك صلاحية لعرض هذه الصفحة. تواصل مع المسؤول إذا كنت تعتقد أن هذا خطأ.
        </p>
      </div>

      <Button variant="outline" onClick={() => navigate(-1)}>
        رجوع
      </Button>
    </div>
  )
}
