'use client'

import { 
  Box, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  Bell, 
  FileText, 
  Zap,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const settingsSections = [
  {
    id: 'entities',
    name: 'Entities',
    description: 'Manage house, garden, rooms and other entities',
    icon: Box,
    count: 8,
    status: 'configured'
  },
  {
    id: 'sensors',
    name: 'Sensors',
    description: 'Configure IoT sensors and data sources',
    icon: Cpu,
    count: 5,
    status: 'configured'
  },
  {
    id: 'measurements',
    name: 'Measurement Streams',
    description: 'Define what data is collected and how',
    icon: Activity,
    count: 12,
    status: 'configured'
  },
  {
    id: 'thresholds',
    name: 'Thresholds',
    description: 'Set alert thresholds for measurements',
    icon: AlertTriangle,
    count: 6,
    status: 'configured'
  },
  {
    id: 'notifications',
    name: 'Notification Channels',
    description: 'Configure how you receive alerts',
    icon: Bell,
    count: 2,
    status: 'configured'
  },
  {
    id: 'protocols',
    name: 'Protocols',
    description: 'Define manual and automated procedures',
    icon: FileText,
    count: 3,
    status: 'configured'
  },
  {
    id: 'automations',
    name: 'Automations',
    description: 'Set up automatic workflows and triggers',
    icon: Zap,
    count: 3,
    status: 'configured'
  }
]

export default function SettingsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Configure your Alona OS installation</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsSections.map(section => (
          <Card 
            key={section.id} 
            className="cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <section.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{section.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {section.count}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {section.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base font-medium">System Information</CardTitle>
          <CardDescription>Current installation details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Version</p>
              <p className="text-sm font-medium mt-1">Alona OS v0.1.0</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Installation</p>
              <p className="text-sm font-medium mt-1">Mountain House</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mode</p>
              <p className="text-sm font-medium mt-1">Normal Operation</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Sync</p>
              <p className="text-sm font-medium mt-1">2 minutes ago</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Model Reference */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base font-medium">Data Model Reference</CardTitle>
          <CardDescription>Key concepts in Alona OS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium">Domain</h4>
              <p className="text-xs text-muted-foreground mt-1">
                A functional area like Energy, Water, or Food Production
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium">Location</h4>
              <p className="text-xs text-muted-foreground mt-1">
                A physical place like House, Garden, or a specific room
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium">Entity</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Any trackable object - a room, system, plant, or device
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium">Resource</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Consumable items like water, electricity, or supplies
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium">Measurement Stream</h4>
              <p className="text-xs text-muted-foreground mt-1">
                A continuous data feed from sensors or calculations
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium">Event</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Any recorded occurrence in the system timeline
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium">Task</h4>
              <p className="text-xs text-muted-foreground mt-1">
                An action item, manual or auto-generated
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium">Protocol</h4>
              <p className="text-xs text-muted-foreground mt-1">
                A defined procedure for specific situations
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium">Automation</h4>
              <p className="text-xs text-muted-foreground mt-1">
                A rule that triggers actions automatically
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
