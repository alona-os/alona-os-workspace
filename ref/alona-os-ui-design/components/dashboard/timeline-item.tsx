import { cn } from '@/lib/utils'
import type { Event } from '@/lib/types'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Shield, 
  Zap, 
  Terminal,
  Eye,
  FileText
} from 'lucide-react'

interface TimelineItemProps {
  event: Event
  className?: string
}

export function TimelineItem({ event, className }: TimelineItemProps) {
  const typeConfig = {
    measurement: { icon: Activity, color: 'bg-info' },
    threshold: { icon: AlertTriangle, color: 'bg-warning' },
    task: { icon: CheckCircle2, color: 'bg-success' },
    expense: { icon: DollarSign, color: 'bg-chart-3' },
    protocol: { icon: FileText, color: 'bg-chart-5' },
    automation: { icon: Zap, color: 'bg-primary' },
    command: { icon: Terminal, color: 'bg-muted-foreground' },
    security: { icon: Shield, color: 'bg-chart-4' },
    observation: { icon: Eye, color: 'bg-chart-2' }
  }

  const config = typeConfig[event.type]
  const Icon = config.icon

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className={cn('flex gap-3', className)}>
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', config.color)}>
        <Icon className="w-4 h-4 text-background" />
      </div>
      <div className="flex-1 min-w-0 pb-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">{event.title}</p>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTime(event.timestamp)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
      </div>
    </div>
  )
}
