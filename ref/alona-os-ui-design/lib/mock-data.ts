import type { 
  Entity, 
  Event, 
  Task, 
  Expense, 
  Alert, 
  RoomEnvironment, 
  EnergyData, 
  WaterData,
  Automation,
  Protocol
} from './types'

// Current date for mock data
const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

// Energy data
export const energyData: EnergyData = {
  batterySOC: 78,
  pvPower: 2.4, // kW
  houseLoad: 1.2, // kW
  batteryPower: 1.2, // kW charging
  generatorStatus: 'standby'
}

// Water data
export const waterData: WaterData = {
  tankLevel: 65,
  tankCapacity: 5000,
  availableLiters: 3250,
  wellStatus: 'online',
  pumpStatus: 'idle',
  dailyUsage: 180
}

// Room environments
export const roomEnvironments: RoomEnvironment[] = [
  {
    id: 'room-1',
    name: 'Living Room',
    location: 'living-room',
    temperature: 21.5,
    humidity: 45,
    trend: 'stable',
    sensorStatus: 'online',
    lastSeen: new Date(now.getTime() - 2 * 60000) // 2 min ago
  },
  {
    id: 'room-2',
    name: 'Bedroom',
    location: 'bedroom',
    temperature: 19.8,
    humidity: 52,
    trend: 'down',
    sensorStatus: 'online',
    lastSeen: new Date(now.getTime() - 3 * 60000)
  },
  {
    id: 'room-3',
    name: 'Bathroom',
    location: 'bathroom',
    temperature: 23.2,
    humidity: 68,
    trend: 'up',
    sensorStatus: 'online',
    lastSeen: new Date(now.getTime() - 1 * 60000)
  }
]

// Active alerts
export const activeAlerts: Alert[] = [
  {
    id: 'alert-1',
    title: 'Water tank below 70%',
    message: 'Consider reducing water usage or scheduling a refill',
    severity: 'warning',
    timestamp: new Date(now.getTime() - 30 * 60000),
    domain: 'water',
    acknowledged: false
  },
  {
    id: 'alert-2',
    title: 'Bathroom humidity high',
    message: 'Humidity at 68% - ventilation recommended',
    severity: 'info',
    timestamp: new Date(now.getTime() - 15 * 60000),
    domain: 'environment',
    entityId: 'room-3',
    acknowledged: false
  }
]

// Tasks
export const tasks: Task[] = [
  {
    id: 'task-1',
    title: 'Check solar panel connections',
    description: 'Inspect all connections on the PV array for corrosion or loose wires',
    status: 'pending',
    priority: 'medium',
    dueDate: today,
    domain: 'energy',
    source: 'maintenance',
    checklist: [
      { id: 'c1', text: 'Inspect MC4 connectors', completed: false },
      { id: 'c2', text: 'Check inverter connections', completed: false },
      { id: 'c3', text: 'Clean panel surfaces', completed: false }
    ]
  },
  {
    id: 'task-2',
    title: 'Replace water filter',
    description: 'Monthly water filter replacement',
    status: 'pending',
    priority: 'high',
    dueDate: today,
    domain: 'water',
    source: 'protocol'
  },
  {
    id: 'task-3',
    title: 'Prune tomato plants',
    description: 'Remove suckers and tie up main stems',
    status: 'in-progress',
    priority: 'low',
    dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
    domain: 'food-production',
    source: 'manual'
  },
  {
    id: 'task-4',
    title: 'Generator maintenance',
    description: 'Change oil and check spark plug',
    status: 'overdue',
    priority: 'high',
    dueDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
    domain: 'energy',
    source: 'maintenance'
  },
  {
    id: 'task-5',
    title: 'Clean bathroom ventilation fan',
    description: 'Remove dust buildup from exhaust fan',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
    domain: 'maintenance',
    source: 'protocol'
  }
]

// Timeline events
export const timelineEvents: Event[] = [
  {
    id: 'event-1',
    type: 'measurement',
    title: 'Battery SOC updated',
    description: 'Battery at 78% capacity',
    timestamp: new Date(now.getTime() - 5 * 60000),
    domain: 'energy',
    severity: 'info'
  },
  {
    id: 'event-2',
    type: 'threshold',
    title: 'Water tank threshold crossed',
    description: 'Tank level dropped below 70%',
    timestamp: new Date(now.getTime() - 30 * 60000),
    domain: 'water',
    severity: 'warning'
  },
  {
    id: 'event-3',
    type: 'automation',
    title: 'Night mode activated',
    description: 'Reduced power consumption mode enabled',
    timestamp: new Date(now.getTime() - 8 * 60 * 60000),
    domain: 'energy',
    severity: 'info'
  },
  {
    id: 'event-4',
    type: 'task',
    title: 'Task completed',
    description: 'Water plants in greenhouse',
    timestamp: new Date(now.getTime() - 4 * 60 * 60000),
    domain: 'food-production',
    severity: 'success'
  },
  {
    id: 'event-5',
    type: 'expense',
    title: 'Expense logged',
    description: 'Garden seeds - $24.50',
    timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60000),
    domain: 'food-production',
    severity: 'info'
  },
  {
    id: 'event-6',
    type: 'observation',
    title: 'Observation added',
    description: 'First tomatoes showing color',
    timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60000),
    domain: 'food-production',
    severity: 'info'
  },
  {
    id: 'event-7',
    type: 'protocol',
    title: 'Protocol activated',
    description: 'Low battery protocol triggered',
    timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60000),
    domain: 'energy',
    severity: 'warning'
  },
  {
    id: 'event-8',
    type: 'security',
    title: 'Motion detected',
    description: 'Front yard camera detected movement',
    timestamp: new Date(now.getTime() - 6 * 60 * 60000),
    domain: 'security',
    severity: 'info'
  }
]

// Expenses
export const expenses: Expense[] = [
  {
    id: 'exp-1',
    title: 'Garden seeds',
    amount: 24.50,
    currency: 'USD',
    date: new Date(now.getTime() - 2 * 24 * 60 * 60000),
    category: 'Supplies',
    domain: 'food-production'
  },
  {
    id: 'exp-2',
    title: 'Water filter replacement',
    amount: 35.00,
    currency: 'USD',
    date: new Date(now.getTime() - 7 * 24 * 60 * 60000),
    category: 'Maintenance',
    domain: 'water'
  },
  {
    id: 'exp-3',
    title: 'Car insurance (annual)',
    amount: 480.00,
    currency: 'USD',
    date: new Date(now.getTime() - 14 * 24 * 60 * 60000),
    category: 'Insurance'
  },
  {
    id: 'exp-4',
    title: 'Petrol for generator',
    amount: 45.00,
    currency: 'USD',
    date: new Date(now.getTime() - 5 * 24 * 60 * 60000),
    category: 'Fuel',
    domain: 'energy'
  },
  {
    id: 'exp-5',
    title: 'Drip irrigation parts',
    amount: 62.00,
    currency: 'USD',
    date: new Date(now.getTime() - 10 * 24 * 60 * 60000),
    category: 'Equipment',
    domain: 'food-production'
  }
]

// Automations
export const automations: Automation[] = [
  {
    id: 'auto-1',
    name: 'Low battery workflow',
    description: 'Reduce non-essential loads when battery drops below 30%',
    trigger: 'Battery SOC < 30%',
    status: 'active',
    lastRun: new Date(now.getTime() - 3 * 24 * 60 * 60000),
    runCount: 5
  },
  {
    id: 'auto-2',
    name: 'Night mode',
    description: 'Enable power saving mode at sunset',
    trigger: 'Sunset',
    status: 'active',
    lastRun: new Date(now.getTime() - 8 * 60 * 60000),
    runCount: 142
  },
  {
    id: 'auto-3',
    name: 'High humidity alert',
    description: 'Send notification when bathroom humidity exceeds 70%',
    trigger: 'Bathroom humidity > 70%',
    status: 'active',
    runCount: 12
  }
]

// Protocols
export const protocols: Protocol[] = [
  {
    id: 'proto-1',
    name: 'Water conservation',
    description: 'Reduce water usage when tank below 40%',
    trigger: 'Manual or tank level < 40%',
    status: 'inactive'
  },
  {
    id: 'proto-2',
    name: 'Generator backup',
    description: 'Start generator when battery critically low',
    trigger: 'Battery SOC < 20%',
    status: 'active'
  },
  {
    id: 'proto-3',
    name: 'Storm preparation',
    description: 'Secure outdoor items and fill water reserves',
    trigger: 'Manual',
    status: 'inactive'
  }
]

// Chart data helpers
export const generateSOCHistory = () => {
  const data = []
  for (let i = 24; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60000)
    const baseSOC = 78
    const variation = Math.sin(i / 4) * 15 + Math.random() * 5
    data.push({
      time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      soc: Math.max(20, Math.min(100, baseSOC + variation))
    })
  }
  return data
}

export const generateWaterUsageHistory = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map(day => ({
    day,
    usage: 120 + Math.random() * 100
  }))
}

export const generateTemperatureHistory = () => {
  const data = []
  for (let i = 12; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60000)
    data.push({
      time: hour.toLocaleTimeString('en-US', { hour: '2-digit' }),
      'Living Room': 20 + Math.random() * 3,
      'Bedroom': 18 + Math.random() * 3,
      'Bathroom': 22 + Math.random() * 3
    })
  }
  return data
}

export const generateEnergyHistory = () => {
  const data = []
  for (let i = 24; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60000)
    const hourOfDay = hour.getHours()
    // PV production peaks at midday
    const pvBase = hourOfDay >= 6 && hourOfDay <= 18 
      ? Math.sin((hourOfDay - 6) / 12 * Math.PI) * 3.5
      : 0
    data.push({
      time: hour.toLocaleTimeString('en-US', { hour: '2-digit' }),
      pv: Math.max(0, pvBase + Math.random() * 0.5),
      load: 0.8 + Math.random() * 0.8,
      battery: 0
    })
  }
  return data
}
