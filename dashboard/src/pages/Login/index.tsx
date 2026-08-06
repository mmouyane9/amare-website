import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Newspaper,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { signIn } from '@/services/auth.service'
import { useAuth } from '@/contexts/AuthContext'
import { useWebsiteSettingsContext } from '@/contexts/WebsiteSettingsContext'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const highlights: { label: string; icon: LucideIcon }[] = [
  { label: 'Manage members, branches and news', icon: Users },
  { label: 'Publish content to the association website', icon: Newspaper },
  { label: 'Control every part of the platform', icon: ShieldCheck },
]

interface LoginErrors {
  email?: string
  password?: string
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [authError, setAuthError] = useState<string | null>(null)

  const { login } = useAuth()
  const { settings } = useWebsiteSettingsContext()
  const navigate = useNavigate()
  const location = useLocation()

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    '/dashboard'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: LoginErrors = {}
    if (!email.trim()) nextErrors.email = 'Email is required'
    if (!password) nextErrors.password = 'Password is required'
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    setAuthError(null)
    try {
      const { data, error } = await signIn(email, password)

      console.log("Session:", data.session);
      console.log("User:", data.user);
      console.log("Current location:", location.pathname);

      if (error) {
        setAuthError(error.message)
        return
      }

      if (data.user) {
        await login(data.user, remember)
      }
      navigate(from, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const logoUrl = settings?.logo_url || '/logo.png'
  const brandName = settings?.short_name || 'AMARE'

  return (
    <div className="flex min-h-svh flex-col bg-background lg:flex-row">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-foreground via-foreground to-primary lg:flex lg:w-[46%] lg:shrink-0">
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute -right-24 -bottom-24 size-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 size-40 rounded-full bg-background/5 blur-2xl" />

        <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt={brandName} className="size-10 rounded-lg object-contain ring-1 ring-background/20" />
            <span className="text-lg font-semibold tracking-tight text-background">
              {brandName}
            </span>
          </div>

          <div className="max-w-md space-y-5">
            <h1 className="text-3xl font-semibold tracking-tight text-background lg:text-4xl">
              Welcome back to the {brandName} Admin
            </h1>
            <p className="text-base leading-relaxed text-background/70">
              Manage members, branches, news and everything else that keeps the
              association running smoothly.
            </p>
          </div>

          <ul className="space-y-3">
            {highlights.map(({ label, icon: Icon }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-background/80">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background/10 ring-1 ring-background/15">
                  <Icon className="size-3.5 text-background/70" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <img src={logoUrl} alt={brandName} className="mx-auto mb-3 size-11 rounded-lg object-contain lg:hidden" />
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Sign in
              </CardTitle>
              <CardDescription>
                Enter your credentials to access the admin panel.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={loading}
                      className={cn(
                        'h-10 pl-9',
                        errors.email && 'border-destructive focus-visible:ring-destructive/20',
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs font-medium text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      disabled={loading}
                      className={cn(
                        'h-10 pr-10 pl-9',
                        errors.password && 'border-destructive focus-visible:ring-destructive/20',
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-xs font-medium text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox
                      checked={remember}
                      onCheckedChange={(checked) => setRemember(checked === true)}
                    />
                    Remember me
                  </label>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-sm font-medium text-primary"
                  >
                    Forgot password?
                  </Button>
                </div>

                {authError && (
                  <p className="text-sm font-medium text-destructive">{authError}</p>
                )}

                <Button
                  type="submit"
                  className="h-10 w-full gap-1.5"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Visiting the association website?{' '}
            <Button variant="link" className="h-auto p-0 text-sm font-medium text-primary">
              Back to website
            </Button>
          </p>
        </div>
      </section>
    </div>
  )
}
