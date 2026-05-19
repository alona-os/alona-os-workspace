import { Battery, Droplets, Fuel, Gauge } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { energyData, waterData } from '@/lib/mock-data'

interface ResourceCardProps {
  name: string
  icon: React.ReactNode
  current: number
  capacity: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  subtitle?: string
}

function ResourceCard({ name, icon, current, capacity, unit, status, subtitle }: ResourceCardProps) {
  const percentage = (current / capacity) * 100
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground">{icon}</div>
            <CardTitle className="text-sm font-medium">{name}</CardTitle>
          </div>
          <Badge 
            variant={status === 'critical' ? 'destructive' : status === 'warning' ? 'secondary' : 'outline'}
            className="text-xs"
          >
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold">{current.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">/ {capacity.toLocaleString()} {unit}</span>
          </div>
          <Progress value={percentage} className="h-2" />
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ResourcesPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Resources</h1>
        <p className="text-muted-foreground text-sm">Production, storage, and consumption overview</p>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ResourceCard
          name="Battery Bank"
          icon={<Battery className="w-5 h-5" />}
          current={Math.round(energyData.batterySOC * 48 / 100)} // 4.8 kWh capacity
          capacity={48}
          unit="kWh"
          status={energyData.batterySOC > 50 ? 'normal' : energyData.batterySOC > 25 ? 'warning' : 'critical'}
          subtitle={`${energyData.batterySOC}% charged`}
        />
        <ResourceCard
          name="Water Tank"
          icon={<Droplets className="w-5 h-5" />}
          current={waterData.availableLiters}
          capacity={waterData.tankCapacity}
          unit="L"
          status={waterData.tankLevel > 50 ? 'normal' : waterData.tankLevel > 25 ? 'warning' : 'critical'}
          subtitle={`${waterData.dailyUsage}L daily avg usage`}
        />
        <ResourceCard
          name="Petrol Reserve"
          icon={<Fuel className="w-5 h-5" />}
          current={35}
          capacity={60}
          unit="L"
          status="normal"
          subtitle="Generator backup fuel"
        />
        <ResourceCard
          name="LPG Gas"
          icon={<Gauge className="w-5 h-5" />}
          current={8}
          capacity={13}
          unit="kg"
          status="normal"
          subtitle="Cooking and heating"
        />
      </div>

      {/* Resource Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Electricity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Electricity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Today Production</span>
                <span className="font-medium">12.4 kWh</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Today Consumption</span>
                <span className="font-medium">8.7 kWh</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Net Flow</span>
                <span className="font-medium text-success">+3.7 kWh</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">7-Day Average</span>
                <span className="font-medium">9.2 kWh/day</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Water */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Water</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Today Usage</span>
                <span className="font-medium">145 L</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Last Refill</span>
                <span className="font-medium">3 days ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Days Remaining</span>
                <span className="font-medium">~18 days</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">7-Day Average</span>
                <span className="font-medium">172 L/day</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
