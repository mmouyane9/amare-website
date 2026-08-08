import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { getPage } from '@/services/pages.service'
import HomePageEditor from './editors/HomePageEditor'

export default function PageEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [slug, setSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getPage(id).then((p) => {
      if (!p) { navigate('/pages'); return }
      setSlug(p.slug)
      setLoading(false)
    })
  }, [id, navigate])

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
  if (!id) return null

  if (slug === '/') return <HomePageEditor />

  return (
    <div className="flex h-96 items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium text-muted-foreground">محرر خاص قيد التطوير</p>
        <p className="mt-1 text-sm text-muted-foreground/70">هذه الصفحة سيتم بناؤها بعد اكتمال الصفحة الرئيسية</p>
      </div>
    </div>
  )
}
