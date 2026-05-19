import { Shield, Camera, Lock, AlertTriangle, Eye, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const securityZones = [
  {
    id: 'zone-1',
    name: 'Main Gate',
    type: 'perimeter',
    status: 'armed',
    lastActivity: '2 hours ago',
    devices: ['Motion Sensor', 'Camera']
  },
  {
    id: 'zone-2',
    name: 'Front Yard',
    type: 'perimeter',
    status: 'armed',
    lastActivity: '45 min ago',
    devices: ['Camera', 'Motion Light']
  },
  {
    id: 'zone-3',
    name: 'Back Garden',
    type: 'perimeter',
    status: 'armed',
    lastActivity: '3 hours ago',
    devices: ['Motion Sensor']
  },
  {
    id: 'zone-4',
    name: 'Main Door',
    type: 'entry',
    status: 'armed',
    lastActivity: '6 hours ago',
    devices: ['Door Sensor', 'Smart Lock']
  }
]

const recentEvents = [
  { id: 1, type: 'motion', zone: 'Front Yard', time: '45 min ago', severity: 'info' },
  { id: 2, type: 'motion', zone: 'Main Gate', time: '2 hours ago', severity: 'info' },
  { id: 3, type: 'door', zone: 'Main Door', time: '6 hours ago', severity: 'info' },
  { id: 4, type: 'motion', zone: 'Back Garden', time: '3 hours ago', severity: 'info' },
]

export default function SecurityPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Security</h1>
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 rounded-full bg-success" />
            All Zones Armed
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">Perimeter monitoring and access control</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Shield className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">4</p>
                <p className="text-xs text-muted-foreground">Zones Armed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Camera className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">2</p>
                <p className="text-xs text-muted-foreground">Cameras Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">1</p>
                <p className="text-xs text-muted-foreground">Smart Lock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Activity className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">4</p>
                <p className="text-xs text-muted-foreground">Events Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Zones */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security Zones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityZones.map((zone) => (
                  <div 
                    key={zone.id} 
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${zone.status === 'armed' ? 'bg-success' : 'bg-muted-foreground'}`} />
                      <div>
                        <p className="font-medium text-sm">{zone.name}</p>
                        <p className="text-xs text-muted-foreground">{zone.devices.join(', ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {zone.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{zone.lastActivity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 py-2">
                  <div className="mt-0.5">
                    {event.type === 'motion' ? (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {event.type === 'motion' ? 'Motion detected' : 'Door activity'}
                    </p>
                    <p className="text-xs text-muted-foreground">{event.zone}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {event.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Notice */}
      <Card className="mt-6 border-dashed">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-1">Security Integration Placeholder</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            This page will integrate with security cameras, motion sensors, door/window sensors, and smart locks when connected.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
