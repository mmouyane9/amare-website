import { useEffect, useState } from 'react'
import { Check, Loader2, ShieldCheck, Smartphone } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { getSettingsService } from '@/services/settings'
import type { LoginEntry } from '@/types/settings'

const recoveryCodes = [
  'AMRE-7F2K-Q3MN',
  'AMRE-9P8L-Z4RT',
  'AMRE-2W6J-X5YU',
  'AMRE-5N4C-V8IO',
  'AMRE-3B7H-N9UJ',
  'AMRE-8K1D-M2PA',
]

export function Security() {
  const service = getSettingsService()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)
  const [logins, setLogins] = useState<LoginEntry[]>([])
  const [loadingLogins, setLoadingLogins] = useState(true)

  useEffect(() => {
    let alive = true
    service.listLoginHistory().then((items) => {
      if (!alive) return
      setLogins(items)
      setLoadingLogins(false)
    })
    return () => {
      alive = false
    }
  }, [service])

  const handlePasswordSave = async () => {
    if (next.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (next !== confirm) {
      setError('New passwords do not match.')
      return
    }
    setError(null)
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSaving(false)
    setSaved(true)
    setCurrent('')
    setNext('')
    setConfirm('')
    window.setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Security
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Protect your account and review recent sign-ins.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Use a strong password you don&apos;t use anywhere else.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password-current">Current password</Label>
            <Input
              id="password-current"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="password-new">New password</Label>
              <Input
                id="password-new"
                type="password"
                autoComplete="new-password"
                value={next}
                onChange={(event) => setNext(event.target.value)}
                aria-invalid={error !== null}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password-confirm">Confirm new password</Label>
              <Input
                id="password-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                aria-invalid={error !== null}
              />
            </div>
          </div>
          {error && (
            <p className="text-xs font-medium text-destructive">{error}</p>
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <p className="text-xs text-muted-foreground">
            {saved ? 'Password updated' : 'You will stay signed in on this device'}
          </p>
          <Button
            type="button"
            onClick={handlePasswordSave}
            disabled={saving || !current || !next || !confirm}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : saved ? (
              <Check className="size-4" />
            ) : null}
            {saved ? 'Updated' : 'Update password'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="size-4" />
                Two-factor authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account.
              </CardDescription>
            </div>
            <Switch
              checked={twoFactor}
              onCheckedChange={(checked) => setTwoFactor(checked === true)}
            />
          </div>
        </CardHeader>
        {twoFactor && (
          <CardContent className="space-y-3 border-t border-border/60 pt-4">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication is enabled (UI preview). Scan the QR code
              with an authenticator app or use one of your recovery codes below.
            </p>
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-background ring-1 ring-border">
                <ShieldCheck className="size-6 text-primary" />
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs font-mono text-muted-foreground sm:grid-cols-3">
                {recoveryCodes.map((code) => (
                  <span key={code}>{code}</span>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login history</CardTitle>
          <CardDescription>Recent sign-in attempts on your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLogins ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Device</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logins.map((login) => (
                  <TableRow key={login.id}>
                    <TableCell className="font-medium text-foreground">
                      {login.email}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {login.device}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {login.location}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'capitalize',
                          login.status === 'success'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-destructive/10 text-destructive',
                        )}
                      >
                        {login.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDateTime(login.time)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
