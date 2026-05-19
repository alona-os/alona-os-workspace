import { Wrench, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const maintenancePlans = [
  {
    id: 'maint-1',
    entity: 'Generator',
    task: 'Oil change',
    interval: '100 hours or 6 months',
    lastPerformed: '2024-01-15',
    nextDue: '2024-07-15',
    status: 'upcoming',
    hoursRemaining: 45
  },
  {
    id: 'maint-2',
    entity: 'Water Filter',
    task: 'Filter replacement',
    interval: 'Monthly',
    lastPerformed: '2024-05-01',
    nextDue: '2024-06-01',
    status: 'due',
    hoursRemaining: null
  },
  {
    id: 'maint-3',
    entity: 'Solar Panels',
    task: 'Panel cleaning',
    interval: 'Quarterly',
    lastPerformed: '2024-04-10',
    nextDue: '2024-07-10',
    status: 'upcoming',
    hoursRemaining: null
  },
  {
    id: 'maint-4',
    entity: 'Battery Bank',
    task: 'Terminal inspection',
    interval: '3 months',
    lastPerformed: '2024-03-20',
    nextDue: '2024-06-20',
    status: 'upcoming',
    hoursRemaining: null
  },
  {
    id: 'maint-5',
    entity: 'Well Pump',
    task: 'Pressure check',
    interval: '6 months',
    lastPerformed: '2024-02-01',
    nextDue: '2024-08-01',
    status: 'upcoming',
    hoursRemaining: null
  }
]

const recentRecords = [
  {
    id: 'rec-1',
    entity: 'Generator',
    task: 'Spark plug replacement',
    performedAt: '2024-05-10',
    cost: 12.50,
    notes: 'Replaced with NGK BPR6ES'
  },
  {
    id: 'rec-2',
    entity: 'Water Filter',
    task: 'Filter replacement',
    performedAt: '2024-05-01',
    cost: 35.00,
    notes: 'Standard 10" sediment filter'
  },
  {
    id: 'rec-3',
    entity: 'Solar Panels',
    task: 'Panel cleaning',
    performedAt: '2024-04-10',
    cost: 0,
    notes: 'Light dust accumulation, no issues found'
  }
]

export default function MaintenancePage() {
  const dueCount = maintenancePlans.filter(m => m.status === 'due').length
  const upcomingCount = maintenancePlans.filter(m => m.status === 'upcoming').length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Maintenance</h1>
        <p className="text-muted-foreground text-sm">Scheduled maintenance and service records</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{dueCount}</p>
                <p className="text-xs text-muted-foreground">Due Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{upcomingCount}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <CheckCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">3</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Wrench className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">5</p>
                <p className="text-xs text-muted-foreground">Active Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maintenance Schedule */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Maintenance Schedule</CardTitle>
              <Button variant="outline" size="sm">Add Plan</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {maintenancePlans.map((plan) => (
                  <div 
                    key={plan.id} 
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        plan.status === 'due' ? 'bg-warning' : 
                        plan.status === 'overdue' ? 'bg-destructive' : 'bg-muted-foreground'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{plan.entity}</p>
                        <p className="text-xs text-muted-foreground">{plan.task}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={plan.status === 'due' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {plan.status === 'due' ? 'Due' : plan.nextDue}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{plan.interval}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Records */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRecords.map((record) => (
                <div key={record.id} className="pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="font-medium text-sm">{record.entity}</p>
                      <p className="text-xs text-muted-foreground">{record.task}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{record.performedAt}</span>
                  </div>
                  {record.cost > 0 && (
                    <p className="text-xs text-muted-foreground">Cost: ${record.cost.toFixed(2)}</p>
                  )}
                  {record.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
