import { FileText, Play, Pause, Clock, CheckSquare, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { protocols } from '@/lib/mock-data'

const protocolTasks = [
  { id: 't1', title: 'Reduce non-essential loads', completed: false },
  { id: 't2', title: 'Check generator fuel level', completed: false },
  { id: 't3', title: 'Prepare generator for possible start', completed: false },
  { id: 't4', title: 'Monitor battery trend', completed: false },
]

export default function ProtocolsPage() {
  const activeProtocols = protocols.filter(p => p.status === 'active')

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Protocols</h1>
        <p className="text-muted-foreground text-sm">System modes and operational checklists</p>
      </div>

      {/* Current Mode */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
              <div>
                <p className="font-medium">Current Mode: Normal</p>
                <p className="text-sm text-muted-foreground">All systems operating normally</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Change Mode
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Play className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{activeProtocols.length}</p>
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
                <p className="text-2xl font-semibold">{protocols.length - activeProtocols.length}</p>
                <p className="text-xs text-muted-foreground">Standby</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{protocols.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
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
                <p className="text-2xl font-semibold">2</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Protocols List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Available Protocols</CardTitle>
              <Button variant="outline" size="sm">Create Protocol</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {protocols.map((protocol) => (
                  <div 
                    key={protocol.id} 
                    className="flex items-start justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1.5 rounded-lg ${
                        protocol.status === 'active' ? 'bg-success/10' : 'bg-muted'
                      }`}>
                        <FileText className={`w-4 h-4 ${
                          protocol.status === 'active' ? 'text-success' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{protocol.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{protocol.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {protocol.trigger}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={protocol.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {protocol.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        {protocol.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Protocol Details / Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <CardTitle className="text-base">Generator Backup Tasks</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Tasks to complete when protocol is activated:
            </p>
            <div className="space-y-3">
              {protocolTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3">
                  <CheckSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{task.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
