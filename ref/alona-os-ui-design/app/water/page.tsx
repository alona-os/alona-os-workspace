'use client'

import { Droplets, Gauge, Activity, AlertTriangle } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { AlertCard } from '@/components/dashboard/alert-card'
import { TaskItem } from '@/components/dashboard/task-item'
import { 
  waterData, 
  activeAlerts,
  tasks,
  generateWaterUsageHistory
} from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts'

export default function WaterPage() {
  const waterUsageHistory = generateWaterUsageHistory()
  const waterAlerts = activeAlerts.filter(a => a.domain === 'water')
  const waterTasks = tasks.filter(t => t.domain === 'water')

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Water</h1>
        <p className="text-muted-foreground text-sm">Water tank, well and usage management</p>
      </div>

      <div className="space-y-6">
        {/* Key Metrics */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Current Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Tank Level"
              value={waterData.tankLevel}
              unit="%"
              status={waterData.tankLevel > 50 ? 'normal' : waterData.tankLevel > 25 ? 'warning' : 'error'}
              icon={<Droplets className="w-5 h-5" />}
              trend="down"
              trendValue="-5%"
            />
            <StatCard
              title="Available"
              value={waterData.availableLiters.toLocaleString()}
              unit="L"
              status="normal"
              icon={<Gauge className="w-5 h-5" />}
              subtitle={`of ${waterData.tankCapacity.toLocaleString()}L capacity`}
            />
            <StatCard
              title="Well Status"
              value={waterData.wellStatus}
              status={waterData.wellStatus === 'online' ? 'success' : 'warning'}
              icon={<Activity className="w-5 h-5" />}
            />
            <StatCard
              title="Daily Usage"
              value={waterData.dailyUsage}
              unit="L"
              status="normal"
              icon={<Droplets className="w-5 h-5" />}
              subtitle="Today&apos;s consumption"
            />
          </div>
        </section>

        {/* Tank Visual and Resource Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tank Visualization */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Tank Level</CardTitle>
              <CardDescription>Main water storage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6">
                <div className="relative w-32 h-48 border-4 border-border rounded-lg overflow-hidden bg-muted">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-chart-2 transition-all duration-500"
                    style={{ height: `${waterData.tankLevel}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-foreground drop-shadow-lg">
                      {waterData.tankLevel}%
                    </span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-lg font-semibold">{waterData.availableLiters.toLocaleString()}L</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resource Flow */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Resource Flow</CardTitle>
              <CardDescription>Water balance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Received */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Received (Well)</span>
                    <span className="text-sm text-muted-foreground">+320L this week</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>

                {/* Consumed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Consumed</span>
                    <span className="text-sm text-muted-foreground">-890L this week</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>

                {/* Estimated Days */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Estimated Supply</p>
                      <p className="text-xs text-muted-foreground">Based on average daily usage</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{Math.round(waterData.availableLiters / waterData.dailyUsage)}</p>
                      <p className="text-xs text-muted-foreground">days remaining</p>
                    </div>
                  </div>
                </div>

                {/* System Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Well Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${waterData.wellStatus === 'online' ? 'bg-success' : 'bg-muted-foreground'}`} />
                      <span className="text-sm font-medium capitalize">{waterData.wellStatus}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Pump Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${waterData.pumpStatus === 'running' ? 'bg-success animate-pulse' : waterData.pumpStatus === 'idle' ? 'bg-muted-foreground' : 'bg-destructive'}`} />
                      <span className="text-sm font-medium capitalize">{waterData.pumpStatus}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Daily Water Usage</CardTitle>
            <CardDescription>This week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterUsageHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    unit="L"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                    formatter={(value: number) => [`${value.toFixed(0)}L`, 'Usage']}
                  />
                  <Bar 
                    dataKey="usage" 
                    fill="oklch(0.6 0.15 220)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Alerts and Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Water Alerts */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <CardTitle className="text-base font-medium">Water Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {waterAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No active alerts</p>
              ) : (
                <div className="space-y-2">
                  {waterAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Water Tasks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Water Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {waterTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No water-related tasks</p>
              ) : (
                <div className="space-y-2">
                  {waterTasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
