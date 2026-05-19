import { Battery, Sun, Plug, Droplets, Plus, FileText, DollarSign, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/dashboard/stat-card'
import { RoomCard } from '@/components/dashboard/room-card'
import { AlertCard } from '@/components/dashboard/alert-card'
import { TaskItem } from '@/components/dashboard/task-item'
import { TimelineItem } from '@/components/dashboard/timeline-item'
import { 
  energyData, 
  waterData, 
  roomEnvironments, 
  activeAlerts, 
  tasks, 
  timelineEvents,
  automations
} from '@/lib/mock-data'

export default function CommandCenterPage() {
  const todayTasks = tasks.filter(t => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const taskDate = new Date(t.dueDate)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate.getTime() === today.getTime() || t.status === 'overdue'
  })

  const overdueTasks = tasks.filter(t => t.status === 'overdue')
  const activeAutomations = automations.filter(a => a.status === 'active')

  const needsAttention = [
    ...activeAlerts.map(a => ({ type: 'alert' as const, item: a })),
    ...overdueTasks.map(t => ({ type: 'task' as const, item: t }))
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Command Center</h1>
        <p className="text-muted-foreground text-sm">Overview of your home systems and operations</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main content - Left side */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Resources Snapshot */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Resources Snapshot</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                title="PV Production"
                value={energyData.pvPower.toFixed(1)}
                unit="kW"
                status="success"
                icon={<Sun className="w-5 h-5" />}
                subtitle="Peak: 3.2 kW"
              />
              <StatCard
                title="House Load"
                value={energyData.houseLoad.toFixed(1)}
                unit="kW"
                status="normal"
                icon={<Plug className="w-5 h-5" />}
                subtitle="Avg: 1.0 kW"
              />
              <StatCard
                title="Water Tank"
                value={waterData.tankLevel}
                unit="%"
                status={waterData.tankLevel > 50 ? 'normal' : 'warning'}
                icon={<Droplets className="w-5 h-5" />}
                subtitle={`${waterData.availableLiters.toLocaleString()}L`}
              />
            </div>
          </section>

          {/* Indoor Environment */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Indoor Environment</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roomEnvironments.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </section>

          {/* Active Alerts */}
          {activeAlerts.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Active Alerts</h2>
              <div className="space-y-2">
                {activeAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </section>
          )}

          {/* Today's Tasks */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-muted-foreground">Today&apos;s Tasks</h2>
              <span className="text-xs text-muted-foreground">
                {todayTasks.filter(t => t.status === 'overdue').length > 0 && (
                  <span className="text-destructive mr-2">
                    {todayTasks.filter(t => t.status === 'overdue').length} overdue
                  </span>
                )}
                {todayTasks.length} total
              </span>
            </div>
            <div className="space-y-2">
              {todayTasks.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No tasks for today</p>
                  </CardContent>
                </Card>
              ) : (
                todayTasks.slice(0, 4).map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))
              )}
            </div>
          </section>

          {/* System Status */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">System Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-xs text-muted-foreground">Automations</span>
                  </div>
                  <p className="text-lg font-semibold">{activeAutomations.length} active</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-xs text-muted-foreground">Security</span>
                  </div>
                  <p className="text-lg font-semibold">All armed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Generator</span>
                  </div>
                  <p className="text-lg font-semibold">Standby</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-xs text-muted-foreground">Network</span>
                  </div>
                  <p className="text-lg font-semibold">Online</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Needs Attention */}
          <Card className={needsAttention.length > 0 ? 'border-warning/50' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {needsAttention.length > 0 && (
                    <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  )}
                  <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
                </div>
                <span className="text-xs text-muted-foreground">{needsAttention.length}</span>
              </div>
            </CardHeader>
            <CardContent>
              {needsAttention.length === 0 ? (
                <div className="py-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-success/10 mx-auto mb-2 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-success" />
                  </div>
                  <p className="text-sm text-muted-foreground">All systems normal</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {needsAttention.slice(0, 5).map((item, index) => (
                    item.type === 'alert' ? (
                      <AlertCard key={`attention-alert-${index}`} alert={item.item} compact />
                    ) : (
                      <TaskItem key={`attention-task-${index}`} task={item.item} compact />
                    )
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {timelineEvents.slice(0, 6).map((event) => (
                  <TimelineItem key={event.id} event={event} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
                  <Plus className="w-4 h-4" />
                  <span className="text-xs">Add Task</span>
                </Button>
                <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Log Expense</span>
                </Button>
                <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">Observation</span>
                </Button>
                <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs">Protocol</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
