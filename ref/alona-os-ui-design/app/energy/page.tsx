'use client'

import { Battery, Sun, Plug, Zap, Power } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { 
  energyData, 
  automations, 
  timelineEvents,
  generateSOCHistory,
  generateEnergyHistory
} from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts'

export default function EnergyPage() {
  const socHistory = generateSOCHistory()
  const energyHistory = generateEnergyHistory()
  const energyEvents = timelineEvents.filter(e => e.domain === 'energy')
  const energyAutomations = automations.filter(a => 
    a.name.toLowerCase().includes('battery') || 
    a.name.toLowerCase().includes('power') ||
    a.name.toLowerCase().includes('night')
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Energy</h1>
        <p className="text-muted-foreground text-sm">Solar, battery and power management</p>
      </div>

      <div className="space-y-6">
        {/* Key Metrics */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Current Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              title="Battery SOC"
              value={energyData.batterySOC}
              unit="%"
              status={energyData.batterySOC > 50 ? 'success' : energyData.batterySOC > 25 ? 'warning' : 'error'}
              icon={<Battery className="w-5 h-5" />}
              trend="up"
              trendValue="+5%"
            />
            <StatCard
              title="PV Power"
              value={energyData.pvPower.toFixed(1)}
              unit="kW"
              status="success"
              icon={<Sun className="w-5 h-5" />}
              subtitle="Active"
            />
            <StatCard
              title="House Load"
              value={energyData.houseLoad.toFixed(1)}
              unit="kW"
              status="normal"
              icon={<Plug className="w-5 h-5" />}
            />
            <StatCard
              title="Battery"
              value={energyData.batteryPower > 0 ? `+${energyData.batteryPower.toFixed(1)}` : energyData.batteryPower.toFixed(1)}
              unit="kW"
              status={energyData.batteryPower > 0 ? 'success' : 'warning'}
              icon={<Zap className="w-5 h-5" />}
              subtitle={energyData.batteryPower > 0 ? 'Charging' : 'Discharging'}
            />
            <StatCard
              title="Generator"
              value={energyData.generatorStatus}
              status={energyData.generatorStatus === 'running' ? 'warning' : 'normal'}
              icon={<Power className="w-5 h-5" />}
              subtitle="Backup ready"
            />
          </div>
        </section>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SOC History */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Battery SOC History</CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={socHistory}>
                    <defs>
                      <linearGradient id="socGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      className="text-muted-foreground"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="soc" 
                      stroke="oklch(0.55 0.15 160)" 
                      fill="url(#socGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Power Flow */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Power Production vs Load</CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={energyHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="pv" 
                      name="PV Production"
                      stroke="oklch(0.65 0.18 85)" 
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="load" 
                      name="House Load"
                      stroke="oklch(0.55 0.12 25)" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events and Automations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Events */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Recent Energy Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {energyEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No recent events</p>
                ) : (
                  energyEvents.slice(0, 5).map((event) => {
                    const timeAgo = Math.round((Date.now() - event.timestamp.getTime()) / 60000)
                    const timeStr = timeAgo < 60 
                      ? `${timeAgo}m ago` 
                      : timeAgo < 1440 
                        ? `${Math.round(timeAgo / 60)}h ago`
                        : `${Math.round(timeAgo / 1440)}d ago`
                    return (
                      <div key={event.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{timeStr}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Automations */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Energy Automations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {energyAutomations.map((automation) => (
                  <div 
                    key={automation.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{automation.name}</p>
                        <Badge 
                          variant={automation.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {automation.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{automation.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Trigger: {automation.trigger}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Run count</p>
                      <p className="text-lg font-semibold">{automation.runCount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
