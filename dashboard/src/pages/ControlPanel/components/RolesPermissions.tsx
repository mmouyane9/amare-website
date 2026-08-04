import { useEffect, useState } from 'react'
import { Check, Loader2, ShieldCheck } from 'lucide-react'

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
import { Checkbox } from '@/components/ui/checkbox'
import { useSaveFeedback } from '@/hooks/use-save-feedback'
import { rolePermissions } from '@/data/settings'
import { getSettingsService } from '@/services/settings'
import type { RoleDefinition } from '@/types/settings'

interface RoleCardProps {
  role: RoleDefinition
  onToggle: (roleId: RoleDefinition['id'], permissions: string[]) => void
  onSave: (role: RoleDefinition) => Promise<void>
}

function RoleCard({ role, onToggle, onSave }: RoleCardProps) {
  const { saving, saved, setSaving, complete } = useSaveFeedback()

  const handleSave = async () => {
    setSaving(true)
    await onSave(role)
    complete()
  }

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="size-4" />
          </span>
          <Badge variant="secondary">
            {role.permissions.length} permission
            {role.permissions.length === 1 ? '' : 's'}
          </Badge>
        </div>
        <CardTitle className="mt-2">{role.label}</CardTitle>
        <CardDescription>{role.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 sm:grid-cols-2">
          {rolePermissions.map((permission) => {
            const checked = role.permissions.includes(permission.key)
            return (
              <li key={permission.key}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() =>
                      onToggle(
                        role.id,
                        checked
                          ? role.permissions.filter((key) => key !== permission.key)
                          : [...role.permissions, permission.key],
                      )
                    }
                  />
                  {permission.label}
                </label>
              </li>
            )
          })}
        </ul>
      </CardContent>
      <CardFooter className="justify-between">
        <p className="text-xs text-muted-foreground">
          {saved ? 'Role updated' : 'Uncheck to revoke'}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : saved ? (
            <Check className="size-3.5" />
          ) : null}
          {saved ? 'Saved' : 'Save role'}
        </Button>
      </CardFooter>
    </Card>
  )
}

export function RolesPermissions() {
  const service = getSettingsService()
  const [roles, setRoles] = useState<RoleDefinition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    service.listRoles().then((items) => {
      if (!alive) return
      setRoles(items)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [service])

  const toggle = (roleId: RoleDefinition['id'], permissions: string[]) => {
    setRoles((prev) =>
      prev.map((role) => (role.id === roleId ? { ...role, permissions } : role)),
    )
  }

  const save = async (role: RoleDefinition) => {
    await service.updateRole(role)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex h-40 items-center justify-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Roles &amp; Permissions
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Control what each role can do across the admin panel.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <RoleCard key={role.id} role={role} onToggle={toggle} onSave={save} />
        ))}
      </div>
    </div>
  )
}
