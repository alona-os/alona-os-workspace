'use client'

import { Thermometer, Droplets, Wifi, WifiOff } from 'lucide-react'
import { RoomCard } from '@/components/dashboard/room-card'
import { 
  roomEnvironments,
  generateTemperatureHistory
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
  Legend
} from 'recharts'

export default function EnvironmentPage() {
  const temperatureHistory = generateTemperatureHistory()
  const onlineSensors = roomEnvironments.filter(r => r.sensorStatus === 'online').length
  const avgTemp = roomEnvironments.reduce((sum, r) => sum + r.temperature, 0) / roomEnvironments.length
  const avgHumidity = roomEnvironments.reduce((sum, r) => sum + r.humidity, 0) / roomEnvironments.length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Environment</h1>
        <p className="text-muted-foreground text-sm">Indoor climate monitoring</p>
      </div>

      <div className="space-y-6">
        {/* Summary Cards */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-muted">
                    <Wifi className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{onlineSensors}/{roomEnvironments.length}</p>
                    <p className="text-xs text-muted-foreground">Sensors Online</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-muted">
                    <Thermometer className="w-5 h-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{avgTemp.toFixed(1)}°C</p>
                    <p className="text-xs text-muted-foreground">Avg Temperature</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-muted">
                    <Droplets className="w-5 h-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{avgHumidity.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Avg Humidity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-muted">
                    <Thermometer className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">18-24°C</p>
                    <p className="text-xs text-muted-foreground">Target Range</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Room Cards */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Room Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roomEnvironments.map((room) => (
              <Card key={room.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">{room.name}</CardTitle>
                    <Badge 
                      variant={room.sensorStatus === 'online' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {room.sensorStatus === 'online' ? (
                        <><Wifi className="w-3 h-3 mr-1" /> Online</>
                      ) : (
                        <><WifiOff className="w-3 h-3 mr-1" /> Offline</>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Temperature */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-chart-4" />
                        <span className="text-xs text-muted-foreground">Temperature</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-semibold">{room.temperature.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">°C</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          room.temperature >= 18 && room.temperature <= 24 
                            ? 'bg-success' 
                            : 'bg-warning'
                        }`} />
                        <span className="text-xs text-muted-foreground">
                          {room.temperature >= 18 && room.temperature <= 24 
                            ? 'In range' 
                            : room.temperature < 18 ? 'Below target' : 'Above target'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Humidity */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-chart-2" />
                        <span className="text-xs text-muted-foreground">Humidity</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-semibold">{room.humidity}</span>
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          room.humidity >= 30 && room.humidity <= 60 
                            ? 'bg-success' 
                            : 'bg-warning'
                        }`} />
                        <span className="text-xs text-muted-foreground">
                          {room.humidity >= 30 && room.humidity <= 60 
                            ? 'Normal' 
                            : room.humidity < 30 ? 'Too dry' : 'Too humid'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last updated</span>
                      <span>{Math.round((Date.now() - room.lastSeen.getTime()) / 60000)} min ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Temperature Comparison Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Temperature Comparison</CardTitle>
            <CardDescription>Last 12 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temperatureHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[15, 30]}
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    unit="°C"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}°C`]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Living Room" 
                    stroke="oklch(0.55 0.12 25)" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Bedroom" 
                    stroke="oklch(0.6 0.15 220)" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Bathroom" 
                    stroke="oklch(0.55 0.15 160)" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sensor Health */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Sensor Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {roomEnvironments.map((room) => (
                <div key={room.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${room.sensorStatus === 'online' ? 'bg-success' : 'bg-destructive'}`} />
                    <span className="text-sm font-medium">{room.name} Sensor</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">
                      Last seen: {Math.round((Date.now() - room.lastSeen.getTime()) / 60000)} min ago
                    </span>
                    <Badge variant={room.sensorStatus === 'online' ? 'default' : 'destructive'}>
                      {room.sensorStatus}
                    </Badge>
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
