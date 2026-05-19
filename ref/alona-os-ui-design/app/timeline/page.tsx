'use client'

import { useState } from 'react'
import { Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { TimelineItem } from '@/components/dashboard/timeline-item'
import { timelineEvents } from '@/lib/mock-data'
import type { Event } from '@/lib/types'

export default function TimelinePage() {
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [domainFilter, setDomainFilter] = useState<string>('all')

  const filteredEvents = timelineEvents.filter(event => {
    const matchesType = typeFilter === 'all' || event.type === typeFilter
    const matchesDomain = domainFilter === 'all' || event.domain === domainFilter
    return matchesType && matchesDomain
  })

  // Group events by date
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const date = event.timestamp.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(event)
    return groups
  }, {} as Record<string, Event[]>)

  // Count by type
  const typeCounts = timelineEvents.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const eventTypes = [
    { value: 'measurement', label: 'Measurements', color: 'bg-info' },
    { value: 'threshold', label: 'Thresholds', color: 'bg-warning' },
    { value: 'task', label: 'Tasks', color: 'bg-success' },
    { value: 'expense', label: 'Expenses', color: 'bg-chart-3' },
    { value: 'protocol', label: 'Protocols', color: 'bg-chart-5' },
    { value: 'automation', label: 'Automations', color: 'bg-primary' },
    { value: 'command', label: 'Commands', color: 'bg-muted-foreground' },
    { value: 'security', label: 'Security', color: 'bg-chart-4' },
    { value: 'observation', label: 'Observations', color: 'bg-chart-2' }
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
        <p className="text-muted-foreground text-sm">Unified activity log across all systems</p>
      </div>

      {/* Event Type Stats */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 mb-6">
        {eventTypes.map(type => (
          <button
            key={type.value}
            onClick={() => setTypeFilter(typeFilter === type.value ? 'all' : type.value)}
            className={`p-3 rounded-lg border transition-colors ${
              typeFilter === type.value 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-card hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${type.color}`} />
              <span className="text-lg font-semibold">{typeCounts[type.value] || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">{type.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {eventTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All domains" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All domains</SelectItem>
            <SelectItem value="energy">Energy</SelectItem>
            <SelectItem value="water">Water</SelectItem>
            <SelectItem value="environment">Environment</SelectItem>
            <SelectItem value="food-production">Food Production</SelectItem>
            <SelectItem value="security">Security</SelectItem>
          </SelectContent>
        </Select>
        {(typeFilter !== 'all' || domainFilter !== 'all') && (
          <button 
            onClick={() => { setTypeFilter('all'); setDomainFilter('all') }}
            className="text-sm text-primary hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedEvents).length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No events match the current filters
            </p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedEvents).map(([date, events]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground font-medium">{date}</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="space-y-0 pl-2 border-l-2 border-border ml-4">
                    {events.map(event => (
                      <div key={event.id} className="relative pl-6 pb-4">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-border" />
                        <TimelineItem event={event} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
