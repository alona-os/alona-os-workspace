'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, Zap, Droplets, Sprout, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { expenses } from '@/lib/mock-data'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'

export default function FinancePage() {
  const [periodFilter, setPeriodFilter] = useState<string>('month')

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const energyExpenses = expenses.filter(e => e.domain === 'energy').reduce((sum, e) => sum + e.amount, 0)
  const waterExpenses = expenses.filter(e => e.domain === 'water').reduce((sum, e) => sum + e.amount, 0)
  const gardenExpenses = expenses.filter(e => e.domain === 'food-production').reduce((sum, e) => sum + e.amount, 0)
  const otherExpenses = totalExpenses - energyExpenses - waterExpenses - gardenExpenses

  // Pie chart data
  const domainData = [
    { name: 'Energy', value: energyExpenses, color: 'oklch(0.65 0.18 85)' },
    { name: 'Water', value: waterExpenses, color: 'oklch(0.6 0.15 220)' },
    { name: 'Garden', value: gardenExpenses, color: 'oklch(0.55 0.15 160)' },
    { name: 'Other', value: otherExpenses, color: 'oklch(0.5 0.05 250)' }
  ].filter(d => d.value > 0)

  // Category data
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getDomainIcon = (domain?: string) => {
    switch (domain) {
      case 'energy': return <Zap className="w-4 h-4 text-chart-3" />
      case 'water': return <Droplets className="w-4 h-4 text-chart-2" />
      case 'food-production': return <Sprout className="w-4 h-4 text-success" />
      default: return <DollarSign className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
          <p className="text-muted-foreground text-sm">Track expenses and allocations</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Log Expense
        </Button>
      </div>

      {/* Period Filter */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm text-muted-foreground">Period:</span>
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">${totalExpenses.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Total This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-chart-3/10">
                <Zap className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-semibold">${energyExpenses.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Energy Costs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-chart-2/10">
                <Droplets className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-semibold">${waterExpenses.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Water Costs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-success/10">
                <Sprout className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">${gardenExpenses.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Garden Costs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Domain Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Expenses by Domain</CardTitle>
            <CardDescription>Distribution across home systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={domainData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {domainData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Expenses by Category</CardTitle>
            <CardDescription>Top spending categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Bar dataKey="value" fill="oklch(0.45 0.12 160)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Log */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Recent Expenses</CardTitle>
          <CardDescription>All logged expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell className="font-medium">{expense.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDomainIcon(expense.domain)}
                      <span className="text-sm capitalize">
                        {expense.domain || 'General'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${expense.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
