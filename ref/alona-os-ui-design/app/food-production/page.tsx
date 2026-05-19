'use client'

import { useState } from 'react'
import { Sprout, TreeDeciduous, Flower2, Bug, Archive, Utensils } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskItem } from '@/components/dashboard/task-item'
import { TimelineItem } from '@/components/dashboard/timeline-item'

// Mock garden data
const gardenData = {
  name: 'Main Garden',
  location: 'South side of house',
  status: 'active',
  size: '200 m²',
  zones: 4,
  activePlants: 12
}

const gardenTasks = [
  {
    id: 'gt-1',
    title: 'Prune tomato plants',
    description: 'Remove suckers and tie up main stems',
    status: 'in-progress' as const,
    priority: 'low' as const,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    domain: 'food-production' as const,
    source: 'manual' as const
  },
  {
    id: 'gt-2',
    title: 'Water greenhouse seedlings',
    description: 'Check moisture and water if needed',
    status: 'pending' as const,
    priority: 'medium' as const,
    dueDate: new Date(),
    domain: 'food-production' as const,
    source: 'protocol' as const
  }
]

const gardenExpenses = [
  { id: 'ge-1', title: 'Garden seeds', amount: 24.50, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: 'ge-2', title: 'Drip irrigation parts', amount: 62.00, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
  { id: 'ge-3', title: 'Compost', amount: 35.00, date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) }
]

const gardenObservations = [
  { id: 'go-1', text: 'First tomatoes showing color', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: 'go-2', text: 'Lettuce ready for harvest', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: 'go-3', text: 'Noticed aphids on pepper plants', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
]

const gardenTimeline = [
  {
    id: 'gtl-1',
    type: 'observation' as const,
    title: 'Observation added',
    description: 'First tomatoes showing color',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    domain: 'food-production' as const,
    severity: 'info' as const
  },
  {
    id: 'gtl-2',
    type: 'task' as const,
    title: 'Task completed',
    description: 'Watered greenhouse seedlings',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    domain: 'food-production' as const,
    severity: 'success' as const
  },
  {
    id: 'gtl-3',
    type: 'expense' as const,
    title: 'Expense logged',
    description: 'Garden seeds - $24.50',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    domain: 'food-production' as const,
    severity: 'info' as const
  }
]

const futureSections = [
  { name: 'Herbs', icon: Flower2, count: 0, description: 'Track herb cultivation' },
  { name: 'Fruit Trees', icon: TreeDeciduous, count: 0, description: 'Monitor orchard health' },
  { name: 'Beehives', icon: Bug, count: 0, description: 'Manage bee colonies' },
  { name: 'Food Storage', icon: Archive, count: 0, description: 'Track preserved foods' },
  { name: 'Food Consumption', icon: Utensils, count: 0, description: 'Log what you eat' }
]

export default function FoodProductionPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Food Production</h1>
        <p className="text-muted-foreground text-sm">Garden, growing and food management</p>
      </div>

      <div className="space-y-6">
        {/* Garden Entity Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Sprout className="w-6 h-6 text-success" />
                </div>
                <div>
                  <CardTitle className="text-lg">{gardenData.name}</CardTitle>
                  <CardDescription>{gardenData.location}</CardDescription>
                </div>
              </div>
              <Badge variant="default" className="text-xs">
                {gardenData.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-semibold">{gardenData.size}</p>
                <p className="text-xs text-muted-foreground">Total Size</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-semibold">{gardenData.zones}</p>
                <p className="text-xs text-muted-foreground">Zones</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-semibold">{gardenData.activePlants}</p>
                <p className="text-xs text-muted-foreground">Active Plants</p>
              </div>
            </div>

            {/* Garden Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="water">Water</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="observations">Observations</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Current Season</h4>
                    <p className="text-muted-foreground text-sm">Spring planting in progress</p>
                    <ul className="mt-3 space-y-1 text-sm">
                      <li>Tomatoes - Growing</li>
                      <li>Peppers - Growing</li>
                      <li>Lettuce - Ready to harvest</li>
                      <li>Carrots - Seedlings</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Quick Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last watered</span>
                        <span>2 hours ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Next task</span>
                        <span>Prune tomatoes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">This month spent</span>
                        <span>$121.50</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="water" className="mt-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Watering Schedule</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    Garden irrigation is connected to the main water system
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span>Zone 1 - Vegetables</span>
                      <span className="text-sm text-muted-foreground">Daily, 6:00 AM</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span>Zone 2 - Herbs</span>
                      <span className="text-sm text-muted-foreground">Every 2 days</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span>Zone 3 - Seedlings</span>
                      <span className="text-sm text-muted-foreground">Twice daily</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>Zone 4 - Perennials</span>
                      <span className="text-sm text-muted-foreground">Weekly</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="mt-4">
                <div className="space-y-2">
                  {gardenTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="expenses" className="mt-4">
                <div className="space-y-2">
                  {gardenExpenses.map(expense => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{expense.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">${expense.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border flex justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-sm font-semibold">
                      ${gardenExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="observations" className="mt-4">
                <div className="space-y-2">
                  {gardenObservations.map(obs => (
                    <div key={obs.id} className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm">{obs.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {obs.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="mt-4">
                <div className="space-y-0">
                  {gardenTimeline.map(event => (
                    <TimelineItem key={event.id} event={event} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Future Sections */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Coming Soon</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {futureSections.map(section => (
              <Card key={section.name} className="opacity-60">
                <CardContent className="p-4 text-center">
                  <div className="p-3 rounded-full bg-muted inline-flex mb-3">
                    <section.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium">{section.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
