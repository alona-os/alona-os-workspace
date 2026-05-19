// Domain types
export type Domain = 
  | 'energy' 
  | 'water' 
  | 'environment' 
  | 'food-production' 
  | 'maintenance' 
  | 'security'

export type Location = 
  | 'house' 
  | 'garden' 
  | 'well' 
  | 'living-room' 
  | 'bedroom' 
  | 'bathroom'

export interface Entity {
  id: string
  name: string
  domain: Domain
  location: Location
  type: string
  status: 'online' | 'offline' | 'warning' | 'error'
  lastSeen: Date
}

export interface MeasurementStream {
  id: string
  entityId: string
  name: string
  unit: string
  currentValue: number
  minValue?: number
  maxValue?: number
  thresholdLow?: number
  thresholdHigh?: number
}

export interface Event {
  id: string
  type: 'measurement' | 'threshold' | 'task' | 'expense' | 'protocol' | 'automation' | 'command' | 'security' | 'observation'
  title: string
  description: string
  timestamp: Date
  entityId?: string
  domain?: Domain
  severity?: 'info' | 'warning' | 'error' | 'success'
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high'
  dueDate: Date
  domain?: Domain
  entityId?: string
  source: 'manual' | 'protocol' | 'automation' | 'maintenance'
  checklist?: { id: string; text: string; completed: boolean }[]
}

export interface Expense {
  id: string
  title: string
  amount: number
  currency: string
  date: Date
  category: string
  domain?: Domain
  entityId?: string
  resourceType?: string
  notes?: string
}

export interface Protocol {
  id: string
  name: string
  description: string
  trigger: string
  status: 'active' | 'inactive'
  lastRun?: Date
}

export interface Automation {
  id: string
  name: string
  description: string
  trigger: string
  status: 'active' | 'inactive' | 'error'
  lastRun?: Date
  runCount: number
}

export interface Alert {
  id: string
  title: string
  message: string
  severity: 'info' | 'warning' | 'error'
  timestamp: Date
  entityId?: string
  domain?: Domain
  acknowledged: boolean
}

export interface RoomEnvironment {
  id: string
  name: string
  location: Location
  temperature: number
  humidity: number
  trend: 'up' | 'down' | 'stable'
  sensorStatus: 'online' | 'offline'
  lastSeen: Date
}

export interface EnergyData {
  batterySOC: number
  pvPower: number
  houseLoad: number
  batteryPower: number // positive = charging, negative = discharging
  generatorStatus: 'off' | 'running' | 'standby'
}

export interface WaterData {
  tankLevel: number // percentage
  tankCapacity: number // liters
  availableLiters: number
  wellStatus: 'online' | 'offline' | 'unknown'
  pumpStatus: 'running' | 'idle' | 'error'
  dailyUsage: number // liters
}
