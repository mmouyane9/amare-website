import { useEffect, useState } from 'react'
import {
  Activity,
  Database,
  Download,
  Loader2,
  Plus,
  RotateCcw,
} from 'lucide-react'

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateTime } from '@/lib/format'
import { getSettingsService } from '@/services/settings'
import type { ActivityLog, BackupRecord } from '@/types/settings'

export function System() {
  const service = getSettingsService()
  const [backups, setBackups] = useState<BackupRecord[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(false)
  const [restoreTarget, setRestoreTarget] = useState<BackupRecord | null>(null)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.all([service.listBackups(), service.listActivityLogs()]).then(
      ([backupItems, logItems]) => {
        if (!alive) return
        setBackups(backupItems)
        setLogs(logItems)
        setLoading(false)
      },
    )
    return () => {
      alive = false
    }
  }, [service])

  const handleCreateBackup = async () => {
    setCreating(true)
    const backup = await service.createBackup(`manual-${new Date().toISOString().slice(0, 10)}`)
    setBackups((prev) => [backup, ...prev])
    setCreating(false)
    setCreated(true)
    window.setTimeout(() => setCreated(false), 2500)
  }

  const handleRestore = async () => {
    if (!restoreTarget) return
    setRestoring(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    setRestoring(false)
    setRestoreTarget(null)
    setCreated(true)
    window.setTimeout(() => setCreated(false), 2500)
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
          System
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Backups, restore and a record of everything happening in the CMS.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="size-4" />
                Backups
              </CardTitle>
              <CardDescription>
                Full snapshots of the website content and settings.
              </CardDescription>
            </div>
            <Button type="button" onClick={handleCreateBackup} disabled={creating}>
              {creating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {created ? 'Done' : 'Create backup'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium text-foreground">
                    {backup.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {backup.size}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {formatDateTime(backup.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground"
                        onClick={() => setRestoreTarget(backup)}
                        aria-label={`Restore ${backup.name}`}
                      >
                        <RotateCcw className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground"
                        aria-label={`Download ${backup.name}`}
                      >
                        <Download className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-between">
          <p className="text-xs text-muted-foreground">
            Automatic backups run nightly at 02:00.
          </p>
          <Badge variant="secondary">Retention: 30 days</Badge>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-4" />
            Activity logs
          </CardTitle>
          <CardDescription>
            A chronological record of actions taken across the CMS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="hidden sm:table-cell">Target</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium text-foreground">
                    {log.actor}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.action}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {log.target}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDateTime(log.time)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={restoreTarget !== null}
        onOpenChange={(open) => !open && setRestoreTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Restore backup?</DialogTitle>
            <DialogDescription>
              Restoring “{restoreTarget?.name}” will replace the current website
              content and settings with this snapshot.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRestoreTarget(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleRestore} disabled={restoring}>
              {restoring && <Loader2 className="size-4 animate-spin" />}
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
