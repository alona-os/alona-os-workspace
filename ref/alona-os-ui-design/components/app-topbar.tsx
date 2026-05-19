'use client'

import { Bell, Plus, Calendar, Sun, Moon, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { activeAlerts } from '@/lib/mock-data'
import { useEffect, useState } from 'react'

export function AppTopbar() {
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const hour = currentTime.getHours()
  const TimeIcon = hour >= 6 && hour < 18 ? Sun : Moon

  const unacknowledgedAlerts = activeAlerts.filter(a => !a.acknowledged)

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card">
      {/* Left side - Mode and DateTime */}
      <div className="flex items-center gap-4">
        {/* System Mode */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-success">Normal</span>
        </div>

        <div className="h-5 w-px bg-border hidden sm:block" />

        {/* Date & Time - only render after mount to avoid hydration mismatch */}
        <div className="hidden sm:flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{mounted ? formattedDate : '---'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {mounted ? <TimeIcon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="text-sm font-mono tabular-nums">{mounted ? formattedTime : '--:--'}</span>
          </div>
        </div>

        {/* Weather placeholder */}
        <div className="hidden md:flex items-center gap-1.5 text-muted-foreground">
          <Cloud className="w-4 h-4" />
          <span className="text-sm">22°C</span>
        </div>
      </div>

      {/* Right side - Alerts and Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Alerts */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unacknowledgedAlerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium">
                  {unacknowledgedAlerts.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-medium">Active Alerts</p>
              <p className="text-xs text-muted-foreground">{unacknowledgedAlerts.length} unacknowledged</p>
            </div>
            {activeAlerts.length === 0 ? (
              <div className="px-3 py-6 text-sm text-muted-foreground text-center">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No active alerts</p>
              </div>
            ) : (
              <>
                {activeAlerts.map((alert) => (
                  <DropdownMenuItem key={alert.id} className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                    <div className="flex items-center gap-2 w-full">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.severity === 'error' ? 'bg-destructive' : 
                        alert.severity === 'warning' ? 'bg-warning' : 'bg-info'
                      }`} />
                      <span className="text-sm font-medium flex-1">{alert.title}</span>
                      <Badge 
                        variant={alert.severity === 'error' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground pl-4">{alert.message}</p>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center justify-center text-sm text-primary">
                  View all alerts
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Action</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2">
              <span className="w-4 h-4 flex items-center justify-center text-xs">+</span>
              Add Task
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <span className="w-4 h-4 flex items-center justify-center text-xs">$</span>
              Log Expense
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <span className="w-4 h-4 flex items-center justify-center text-xs">!</span>
              Add Observation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-warning">
              <span className="w-4 h-4 flex items-center justify-center text-xs">!</span>
              Activate Protocol
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
