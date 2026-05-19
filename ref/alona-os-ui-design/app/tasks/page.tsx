'use client'

import { useState } from 'react'
import { CheckSquare, Filter, Plus, Clock, AlertCircle, CheckCircle2, Circle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { tasks } from '@/lib/mock-data'
import type { Task } from '@/lib/types'

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [domainFilter, setDomainFilter] = useState<string>('all')

  const filteredTasks = domainFilter === 'all' 
    ? tasks 
    : tasks.filter(t => t.domain === domainFilter)

  const groupedTasks = {
    overdue: filteredTasks.filter(t => t.status === 'overdue'),
    today: filteredTasks.filter(t => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const taskDate = new Date(t.dueDate)
      taskDate.setHours(0, 0, 0, 0)
      return taskDate.getTime() === today.getTime() && t.status !== 'overdue'
    }),
    upcoming: filteredTasks.filter(t => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const taskDate = new Date(t.dueDate)
      taskDate.setHours(0, 0, 0, 0)
      return taskDate.getTime() > today.getTime()
    })
  }

  const statusConfig = {
    'pending': { icon: Circle, color: 'text-muted-foreground', label: 'Pending' },
    'in-progress': { icon: Clock, color: 'text-info', label: 'In Progress' },
    'completed': { icon: CheckCircle2, color: 'text-success', label: 'Completed' },
    'overdue': { icon: AlertCircle, color: 'text-destructive', label: 'Overdue' }
  }

  const priorityColors = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-warning/20 text-warning',
    high: 'bg-destructive/20 text-destructive'
  }

  const formatDueDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm">Manage your home and farm tasks</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter by:</span>
        </div>
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
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-destructive/10">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{groupedTasks.overdue.length}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{groupedTasks.today.length}</p>
                <p className="text-xs text-muted-foreground">Due Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-info/10">
                <CheckSquare className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{groupedTasks.upcoming.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-muted">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{filteredTasks.length}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Lists */}
      <div className="space-y-6">
        {/* Overdue */}
        {groupedTasks.overdue.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-destructive mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Overdue ({groupedTasks.overdue.length})
            </h2>
            <div className="space-y-2">
              {groupedTasks.overdue.map(task => (
                <TaskRow 
                  key={task.id} 
                  task={task} 
                  onClick={() => setSelectedTask(task)}
                  statusConfig={statusConfig}
                  priorityColors={priorityColors}
                  formatDueDate={formatDueDate}
                />
              ))}
            </div>
          </section>
        )}

        {/* Today */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Today ({groupedTasks.today.length})
          </h2>
          {groupedTasks.today.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center bg-card rounded-lg border border-border">
              No tasks due today
            </p>
          ) : (
            <div className="space-y-2">
              {groupedTasks.today.map(task => (
                <TaskRow 
                  key={task.id} 
                  task={task} 
                  onClick={() => setSelectedTask(task)}
                  statusConfig={statusConfig}
                  priorityColors={priorityColors}
                  formatDueDate={formatDueDate}
                />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Upcoming ({groupedTasks.upcoming.length})
          </h2>
          {groupedTasks.upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center bg-card rounded-lg border border-border">
              No upcoming tasks
            </p>
          ) : (
            <div className="space-y-2">
              {groupedTasks.upcoming.map(task => (
                <TaskRow 
                  key={task.id} 
                  task={task} 
                  onClick={() => setSelectedTask(task)}
                  statusConfig={statusConfig}
                  priorityColors={priorityColors}
                  formatDueDate={formatDueDate}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Task Detail Sheet */}
      <Sheet open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <SheetContent>
          {selectedTask && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedTask.title}</SheetTitle>
                <SheetDescription>
                  Task details and checklist
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Status and Priority */}
                <div className="flex items-center gap-2">
                  <Badge className={priorityColors[selectedTask.priority]}>
                    {selectedTask.priority} priority
                  </Badge>
                  <Badge variant="outline">{selectedTask.status}</Badge>
                </div>

                {/* Description */}
                {selectedTask.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Due Date</span>
                    <span className="text-sm">{formatDueDate(selectedTask.dueDate)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Domain</span>
                    <span className="text-sm capitalize">{selectedTask.domain || 'General'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Source</span>
                    <span className="text-sm capitalize">{selectedTask.source}</span>
                  </div>
                </div>

                {/* Checklist */}
                {selectedTask.checklist && selectedTask.checklist.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Checklist</h4>
                    <div className="space-y-2">
                      {selectedTask.checklist.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                          <Checkbox checked={item.completed} />
                          <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1">Mark Complete</Button>
                  <Button variant="outline" className="flex-1">Edit Task</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function TaskRow({ 
  task, 
  onClick,
  statusConfig,
  priorityColors,
  formatDueDate
}: { 
  task: Task
  onClick: () => void
  statusConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }>
  priorityColors: Record<string, string>
  formatDueDate: (date: Date) => string
}) {
  const config = statusConfig[task.status]
  const Icon = config.icon

  return (
    <div 
      className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <Icon className={`w-5 h-5 shrink-0 ${config.color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{task.title}</p>
          <Badge className={`text-xs shrink-0 ${priorityColors[task.priority]}`}>
            {task.priority}
          </Badge>
          {task.domain && (
            <Badge variant="outline" className="text-xs shrink-0">
              {task.domain}
            </Badge>
          )}
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground truncate mt-1">{task.description}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-muted-foreground">{formatDueDate(task.dueDate)}</p>
        <p className="text-xs text-muted-foreground capitalize">{task.source}</p>
      </div>
    </div>
  )
}
