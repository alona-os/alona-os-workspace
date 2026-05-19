import { cn } from '@/lib/utils'
import type { RoomEnvironment } from '@/lib/types'
import { Thermometer, Droplets, TrendingUp, TrendingDown, Minus, Wifi, WifiOff } from 'lucide-react'

interface RoomCardProps {
  room: RoomEnvironment
  className?: string
}

export function RoomCard({ room, className }: RoomCardProps) {
  const TrendIcon = room.trend === 'up' ? TrendingUp : room.trend === 'down' ? TrendingDown : Minus
  const isOnline = room.sensorStatus === 'online'
  const lastSeenMinutes = Math.round((Date.now() - room.lastSeen.getTime()) / 60000)

  return (
    <div className={cn('bg-card rounded-lg border border-border p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">{room.name}</h3>
        <div className={cn(
          'flex items-center gap-1 text-xs',
          isOnline ? 'text-success' : 'text-destructive'
        )}>
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Temperature */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-muted">
            <Thermometer className="w-4 h-4 text-chart-4" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-semibold">{room.temperature.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">°C</span>
              <TrendIcon className={cn(
                'w-3 h-3',
                room.trend === 'up' && 'text-chart-4',
                room.trend === 'down' && 'text-chart-2',
                room.trend === 'stable' && 'text-muted-foreground'
              )} />
            </div>
            <span className="text-xs text-muted-foreground">Temperature</span>
          </div>
        </div>
        
        {/* Humidity */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-muted">
            <Droplets className="w-4 h-4 text-chart-2" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-semibold">{room.humidity}</span>
              <span className="text-xs text-muted-foreground">%</span>
            </div>
            <span className="text-xs text-muted-foreground">Humidity</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">
          Last updated {lastSeenMinutes}m ago
        </span>
      </div>
    </div>
  )
}
