import { Bot, Play, Pause, Clock, Zap, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { automations } from '@/lib/mock-data'

const automationRuns = [
  {
    id: 'run-1',
    automation: 'Night mode',
    status: 'success',
    startedAt: '2024-05-15 20:30',
    duration: '0.3s',
    trigger: 'Sunset'
  },
  {
    id: 'run-2',
    automation: 'High humidity alert',
    status: 'success',
    startedAt: '2024-05-15 14:22',
    duration: '0.1s',
    trigger: 'Threshold crossed'
  },
  {
    id: 'run-3',
    automation: 'Night mode',
    status: 'success',
    startedAt: '2024-05-14 20:28',
    duration: '0.3s',
    trigger: 'Sunset'
  },
  {
    id: 'run-4',
    automation: 'Low battery workflow',
    status: 'success',
    startedAt: '2024-05-12 18:45',
    duration: '1.2s',
    trigger: 'Battery < 30%'
  }
]

export default function AutomationsPage() {
  const activeCount = automations.filter(a => a.status === 'active').length
  const totalRuns = automations.reduce((sum, a) => sum + a.runCount, 0)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Automations</h1>
        <p className="text-muted-foreground text-sm">Automated workflows and smart rules</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Bot className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Pause className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{automations.length - activeCount}</p>
                <p className="text-xs text-muted-foreground">Paused</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Zap className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{totalRuns}</p>
                <p className="text-xs text-muted-foreground">Total Runs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">4</p>
                <p className="text-xs text-muted-foreground">Runs Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Automations List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Automations</CardTitle>
              <Button variant="outline" size="sm">Create Automation</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automations.map((automation) => (
                  <div 
                    key={automation.id} 
                    className="flex items-start justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1.5 rounded-lg ${
                        automation.status === 'active' ? 'bg-success/10' : 'bg-muted'
                      }`}>
                        <Bot className={`w-4 h-4 ${
                          automation.status === 'active' ? 'text-success' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{automation.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{automation.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Trigger: {automation.trigger}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {automation.runCount} runs
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={automation.status === 'active'} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Runs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {automationRuns.map((run) => (
                <div key={run.id} className="flex items-start gap-3 py-2">
                  <div className="mt-0.5">
                    {run.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{run.automation}</p>
                    <p className="text-xs text-muted-foreground">{run.trigger}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{run.startedAt.split(' ')[1]}</p>
                    <p className="text-xs text-muted-foreground">{run.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
