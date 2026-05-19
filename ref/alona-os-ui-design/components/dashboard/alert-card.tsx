import { cn } from '@/lib/utils'
import type { Alert } from '@/lib/types'
import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface AlertCardProps {
  alert: Alert
  onDismiss?: (id: string) => void
  compact?: boolean
  className?: string
}

export function AlertCard({ alert, onDismiss, compact = false, className }: AlertCardProps) {
  const severityConfig = {
    info: {
      icon: Info,
      bg: 'bg-info/10',
      border: 'border-info/30',
      text: 'text-info'
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      text: 'text-warning'
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
      text: 'text-destructive'
    }
  }

  const config = severityConfig[alert.severity]
  const Icon = config.icon
  const timeAgo = Math.round((Date.now() - alert.timestamp.getTime()) / 60000)

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 py-2', className)}>
        <Icon className={cn('w-4 h-4 shrink-0', config.text)} />
        <span className="text-sm flex-1 truncate">{alert.title}</span>
        <span className="text-xs text-muted-foreground">{timeAgo}m ago</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border',
        config.bg,
        config.border,
        className
      )}
    >
      <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', config.text)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{alert.title}</p>
          {alert.domain && (
            <Badge variant="outline" className="text-xs">
              {alert.domain}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
        <p className="text-xs text-muted-foreground mt-1">{timeAgo}m ago</p>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => onDismiss(alert.id)}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
