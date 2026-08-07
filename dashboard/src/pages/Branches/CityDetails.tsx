import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  Calendar,
  ChevronLeft,
  Heart,
  ImagePlus,
  Loader2,
  MessageSquare,
  Newspaper,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import { MOCK_REGIONS } from '@/data/branches'

interface MockPost {
  id: string
  title: string
  description: string
  imageUrl?: string
  date: string
}

interface MockGalleryImage {
  id: string
  description: string
  imageUrl?: string
}

const MOCK_POSTS: MockPost[] = [
  {
    id: 'p1',
    title: 'استكشاف شلالات أوزود',
    description: 'رحلة استكشافية رائعة إلى شلالات أوزود الخلابة في جبال الأطلس، مع مجموعة من أعضاء الجمعية.',
    date: '2025-12-15',
  },
  {
    id: 'p2',
    title: 'لقاء الأعضاء الشهري',
    description: 'الاجتماع الشهري لأعضاء فرع أزيلال لمناقشة خطة الأنشطة القادمة والمشاريع الميدانية.',
    date: '2025-11-28',
  },
  {
    id: 'p3',
    title: 'حملة تنظيف المسالك الجبلية',
    description: 'مبادرة بيئية لتنظيف المسالك الجبلية في منطقة أزيلال بمشاركة متطوعين من الجمعية والسكان المحليين.',
    date: '2025-11-10',
  },
  {
    id: 'p4',
    title: 'ورشة التصوير الفوتوغرافي',
    description: 'ورشة تدريبية حول أساسيات التصوير الفوتوغرافي في الطبيعة، نظمها فرع أزيلال للأعضاء الجدد.',
    date: '2025-10-22',
  },
]

const MOCK_GALLERY: MockGalleryImage[] = [
  { id: 'g1', description: 'منظر عام لشلالات أوزود' },
  { id: 'g2', description: 'جبال الأطلس في الشتاء' },
  { id: 'g3', description: 'بحيرة بين الويدان' },
  { id: 'g4', description: 'الغابات المحيطة بأزيلال' },
  { id: 'g5', description: 'منظر الغروب من قمم الأطلس' },
  { id: 'g6', description: 'القرية الجبلية التقليدية' },
]

interface PostFormData {
  title: string
  description: string
  imageUrl?: string
}

interface GalleryFormData {
  description: string
  imageUrl?: string
}

const EMPTY_POST_FORM: PostFormData = {
  title: '',
  description: '',
}

const EMPTY_GALLERY_FORM: GalleryFormData = {
  description: '',
}

export default function CityDetailsPage() {
  const { regionId, cityId } = useParams<{ regionId: string; cityId: string }>()
  const navigate = useNavigate()

  const region = MOCK_REGIONS.find((r) => r.id === regionId) ?? null
  const city = region?.cities.find((c) => c.id === cityId) ?? null

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: city?.name ?? '',
    description: city?.description ?? '',
  })
  const [coverUrl] = useState<string | undefined>(city?.coverImage)

  const [settings, setSettings] = useState({
    showCity: true,
    allowPosts: true,
    allowComments: true,
    allowLikes: true,
  })

  const [posts] = useState<MockPost[]>(MOCK_POSTS)
  const [gallery] = useState<MockGalleryImage[]>(MOCK_GALLERY)

  const [postModalOpen, setPostModalOpen] = useState(false)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [postForm, setPostForm] = useState<PostFormData>(EMPTY_POST_FORM)
  const [postSaving, setPostSaving] = useState(false)
  const [deletePostTarget, setDeletePostTarget] = useState<MockPost | null>(null)
  const [deletingPost, setDeletingPost] = useState(false)

  const [galleryModalOpen, setGalleryModalOpen] = useState(false)
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null)
  const [galleryForm, setGalleryForm] = useState<GalleryFormData>(EMPTY_GALLERY_FORM)
  const [gallerySaving, setGallerySaving] = useState(false)
  const [deleteImageTarget, setDeleteImageTarget] = useState<MockGalleryImage | null>(null)
  const [deletingImage, setDeletingImage] = useState(false)

  if (!region || !city) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Building2 className="size-14 text-muted-foreground/25" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          المدينة غير موجودة.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 gap-1.5"
          onClick={() => navigate('/branches')}
        >
          <ChevronLeft className="size-3.5" />
          العودة إلى الفروع الجهوية
        </Button>
      </div>
    )
  }

  const handleEditToggle = () => {
    if (editing) {
      setForm({ name: city.name, description: city.description })
    }
    setEditing(!editing)
  }

  const handleFormChange = (field: 'name' | 'description', value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setEditing(false)
    }, 500)
  }

  const openPostCreate = () => {
    setEditingPostId(null)
    setPostForm(EMPTY_POST_FORM)
    setPostModalOpen(true)
  }

  const openPostEdit = (post: MockPost) => {
    setEditingPostId(post.id)
    setPostForm({ title: post.title, description: post.description })
    setPostModalOpen(true)
  }

  const handlePostSave = () => {
    setPostSaving(true)
    setTimeout(() => {
      setPostSaving(false)
      setPostModalOpen(false)
    }, 500)
  }

  const handlePostDelete = () => {
    setDeletingPost(true)
    setTimeout(() => {
      setDeletingPost(false)
      setDeletePostTarget(null)
    }, 500)
  }

  const openGalleryCreate = () => {
    setEditingGalleryId(null)
    setGalleryForm(EMPTY_GALLERY_FORM)
    setGalleryModalOpen(true)
  }

  const openGalleryEdit = (image: MockGalleryImage) => {
    setEditingGalleryId(image.id)
    setGalleryForm({ description: image.description })
    setGalleryModalOpen(true)
  }

  const handleGallerySave = () => {
    setGallerySaving(true)
    setTimeout(() => {
      setGallerySaving(false)
      setGalleryModalOpen(false)
    }, 500)
  }

  const handleImageDelete = () => {
    setDeletingImage(true)
    setTimeout(() => {
      setDeletingImage(false)
      setDeleteImageTarget(null)
    }, 500)
  }

  return (
    <div>
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link
          to="/branches"
          className="transition-colors hover:text-foreground"
        >
          الفروع الجهوية
        </Link>
        <ChevronLeft className="size-3.5" />
        <Link
          to={`/branches/${region.id}`}
          className="transition-colors hover:text-foreground"
        >
          {region.name}
        </Link>
        <ChevronLeft className="size-3.5" />
        <span className="font-medium text-foreground">{city.name}</span>
      </nav>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            مدينة {city.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            إدارة صفحة المدينة والمحتوى الخاص بها.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={handleEditToggle} disabled={saving}>
                إلغاء
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-1.5">
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                حفظ
              </Button>
            </>
          ) : (
            <Button onClick={handleEditToggle} variant="outline" className="gap-1.5">
              <Pencil className="size-4" />
              تعديل
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Card className="overflow-hidden">
          {coverUrl ? (
            <div className="relative">
              <img
                src={coverUrl}
                alt={city.name}
                className="h-56 w-full object-cover"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-3 left-3 bg-background/80 text-foreground backdrop-blur-sm hover:bg-background"
              >
                <ImagePlus className="size-3.5" />
                تغيير الغلاف
              </Button>
            </div>
          ) : (
            <div className="relative flex h-56 items-center justify-center bg-muted/30">
              <div className="text-center">
                <Building2 className="mx-auto size-10 text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">
                  لا توجد صورة غلاف
                </p>
                <Button variant="outline" size="sm" className="mt-3 gap-1.5">
                  <ImagePlus className="size-3.5" />
                  إضافة غلاف
                </Button>
              </div>
            </div>
          )}
          <div className="border-t border-border/60 px-(--card-spacing) py-4">
            {editing ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="city-name">اسم المدينة</Label>
                  <Input
                    id="city-name"
                    value={form.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city-desc">نبذة قصيرة</Label>
                  <Textarea
                    id="city-desc"
                    value={form.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    اسم المدينة
                  </Label>
                  <p className="mt-0.5 text-sm font-medium">{city.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    نبذة قصيرة
                  </Label>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {city.description || 'لا يوجد وصف.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card size="sm">
            <CardHeader>
              <CardDescription>عدد الأعضاء</CardDescription>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                {city.members.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Users className="size-4" />
              </span>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardDescription>عدد المنشورات</CardDescription>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                {city.posts.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Newspaper className="size-4" />
              </span>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardDescription>عدد الإعجابات</CardDescription>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                142
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <span className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Heart className="size-4" />
              </span>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardDescription>عدد التعليقات</CardDescription>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                86
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <MessageSquare className="size-4" />
              </span>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>المنشورات</CardTitle>
                <CardDescription>
                  منشورات هذه المدينة.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={openPostCreate}
              >
                <Plus className="size-3.5" />
                + منشور جديد
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Newspaper className="size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  لا توجد منشورات بعد.
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  أضف أول منشور لهذه المدينة.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="overflow-hidden rounded-lg border border-border/60 transition-colors hover:border-border"
                  >
                    <div className="flex h-40 items-center justify-center bg-muted/30">
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Newspaper className="size-8 text-muted-foreground/25" />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium">{post.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {post.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="size-3" />
                          {post.date}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            title="فتح"
                          >
                            <ArrowRight className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => openPostEdit(post)}
                            title="تعديل"
                          >
                            <Pencil className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeletePostTarget(post)}
                            title="حذف"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>معرض الصور</CardTitle>
                <CardDescription>
                  الصور الخاصة بهذه المدينة.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={openGalleryCreate}
              >
                <Plus className="size-3.5" />
                + إضافة صورة
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            {gallery.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ImagePlus className="size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  لا توجد صور بعد.
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  أضف صوراً إلى معرض المدينة.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {gallery.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-lg border border-border/60 transition-colors hover:border-border"
                  >
                    <div className="flex h-40 items-center justify-center bg-muted/30">
                      {image.imageUrl ? (
                        <img
                          src={image.imageUrl}
                          alt={image.description}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImagePlus className="size-8 text-muted-foreground/25" />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                      <span className="min-w-0 flex-1 truncate text-right text-xs text-muted-foreground">
                        {image.description}
                      </span>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => openGalleryEdit(image)}
                          title="تعديل"
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleteImageTarget(image)}
                          title="حذف"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الإعدادات</CardTitle>
            <CardDescription>
              تخصيص إعدادات الظهور والتفاعل.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>إظهار المدينة في الموقع</Label>
                <p className="text-xs text-muted-foreground">
                  إظهار هذه المدينة على الموقع الإلكتروني.
                </p>
              </div>
              <Switch
                checked={settings.showCity}
                onCheckedChange={(v) =>
                  setSettings((prev) => ({ ...prev, showCity: v }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>السماح بالمنشورات</Label>
                <p className="text-xs text-muted-foreground">
                  السماح للأعضاء بإنشاء منشورات في هذه المدينة.
                </p>
              </div>
              <Switch
                checked={settings.allowPosts}
                onCheckedChange={(v) =>
                  setSettings((prev) => ({ ...prev, allowPosts: v }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>السماح بالتعليقات</Label>
                <p className="text-xs text-muted-foreground">
                  تفعيل التعليقات على محتوى المدينة.
                </p>
              </div>
              <Switch
                checked={settings.allowComments}
                onCheckedChange={(v) =>
                  setSettings((prev) => ({ ...prev, allowComments: v }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>السماح بالإعجابات</Label>
                <p className="text-xs text-muted-foreground">
                  تفعيل التفاعلات على منشورات المدينة.
                </p>
              </div>
              <Switch
                checked={settings.allowLikes}
                onCheckedChange={(v) =>
                  setSettings((prev) => ({ ...prev, allowLikes: v }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={postModalOpen} onOpenChange={setPostModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPostId ? 'تعديل المنشور' : 'منشور جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingPostId
                ? 'قم بتحديث تفاصيل المنشور أدناه.'
                : 'أدخل تفاصيل المنشور الجديد.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-title">العنوان</Label>
              <Input
                id="post-title"
                value={postForm.title}
                onChange={(e) =>
                  setPostForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="أدخل عنوان المنشور"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-desc">الوصف</Label>
              <Textarea
                id="post-desc"
                value={postForm.description}
                onChange={(e) =>
                  setPostForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="أدخل وصف المنشور..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>الصورة</Label>
              <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/50">
                <ImagePlus className="size-6" />
                <span className="text-sm font-medium">رفع صورة</span>
                <span className="text-xs">PNG, JPG, WEBP</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPostModalOpen(false)}
              disabled={postSaving}
            >
              إلغاء
            </Button>
            <Button onClick={handlePostSave} disabled={postSaving}>
              {postSaving && <Loader2 className="ml-1 size-3 animate-spin" />}
              نشر
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletePostTarget}
        onOpenChange={(open) => {
          if (!open) setDeletePostTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف المنشور</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف{' '}
              <span className="font-medium text-foreground">
                {deletePostTarget?.title ?? 'هذا المنشور'}
              </span>
              ؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletePostTarget(null)}
              disabled={deletingPost}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handlePostDelete}
              disabled={deletingPost}
            >
              {deletingPost && <Loader2 className="ml-1 size-3 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={galleryModalOpen} onOpenChange={setGalleryModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingGalleryId ? 'تعديل الصورة' : 'إضافة صورة'}
            </DialogTitle>
            <DialogDescription>
              {editingGalleryId
                ? 'قم بتحديث تفاصيل الصورة أدناه.'
                : 'أدخل تفاصيل الصورة الجديدة.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الصورة</Label>
              <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/50">
                <ImagePlus className="size-6" />
                <span className="text-sm font-medium">رفع صورة</span>
                <span className="text-xs">PNG, JPG, WEBP</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-desc">الوصف</Label>
              <Input
                id="image-desc"
                value={galleryForm.description}
                onChange={(e) =>
                  setGalleryForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="أدخل وصف الصورة"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGalleryModalOpen(false)}
              disabled={gallerySaving}
            >
              إلغاء
            </Button>
            <Button onClick={handleGallerySave} disabled={gallerySaving}>
              {gallerySaving && <Loader2 className="ml-1 size-3 animate-spin" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteImageTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteImageTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الصورة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف{' '}
              <span className="font-medium text-foreground">
                {deleteImageTarget?.description || 'هذه الصورة'}
              </span>
              ؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteImageTarget(null)}
              disabled={deletingImage}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleImageDelete}
              disabled={deletingImage}
            >
              {deletingImage && <Loader2 className="ml-1 size-3 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
