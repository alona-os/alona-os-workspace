import { cn } from '@/lib/utils'
import type { Task } from '@/lib/types'
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TaskItemProps {
  task: Task
  compact?: boolean
  className?: string
}

export function TaskItem({ task, compact = false, className }: TaskItemProps) {
  const statusConfig = {
    'pending': { icon: Circle, color: 'text-muted-foreground' },
    'in-progress': { icon: Clock, color: 'text-info' },
    'completed': { icon: CheckCircle2, color: 'text-success' },
    'overdue': { icon: AlertCircle, color: 'text-destructive' }
  }

  const priorityColors = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-warning/20 text-warning',
    high: 'bg-destructive/20 text-destructive'
  }

  const config = statusConfig[task.status]
  const Icon = config.icon

  const formatDueDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(date)
    dueDate.setHours(0, 0, 0, 0)
    
    const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`
    if (diffDays <= 7) return `In ${diffDays} days`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 py-2', className)}>
        <Icon className={cn('w-4 h-4 shrink-0', config.color)} />
        <span className="text-sm flex-1 truncate">{task.title}</span>
        <span className="text-xs text-muted-foreground">{formatDueDate(task.dueDate)}</span>
      </div>
    )
  }

  return (
    <div className={cn('flex items-start gap-3 p-3 bg-card rounded-lg border border-border', className)}>
      <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', config.color)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium">{task.title}</p>
          <Badge className={cn('text-xs', priorityColors[task.priority])}>
            {task.priority}
          </Badge>
          {task.domain && (
            <Badge variant="outline" className="text-xs">
              {task.domain}
            </Badge>
          )}
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-muted-foreground">
            Due: {formatDueDate(task.dueDate)}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            Source: {task.source}
          </span>
        </div>
      </div>
    </div>
  )
}
