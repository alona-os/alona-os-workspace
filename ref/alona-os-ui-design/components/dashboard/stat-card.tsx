import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  unit?: string
  subtitle?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  status?: 'normal' | 'warning' | 'error' | 'success'
  icon?: React.ReactNode
  className?: string
}

export function StatCard({
  title,
  value,
  unit,
  subtitle,
  trend,
  trendValue,
  status = 'normal',
  icon,
  className
}: StatCardProps) {
  const statusColors = {
    normal: 'border-border',
    warning: 'border-warning',
    error: 'border-destructive',
    success: 'border-success'
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div
      className={cn(
        'bg-card rounded-lg border-l-4 p-4',
        statusColors[status],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold tracking-tight">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {icon && (
            <div className="text-muted-foreground">{icon}</div>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-xs',
              trend === 'up' && 'text-success',
              trend === 'down' && 'text-destructive',
              trend === 'stable' && 'text-muted-foreground'
            )}>
              <TrendIcon className="w-3 h-3" />
              {trendValue && <span>{trendValue}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
