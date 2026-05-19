'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Zap,
  Droplets,
  Thermometer,
  Sprout,
  Shield,
  CheckSquare,
  Wrench,
  Bot,
  FileText,
  DollarSign,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Command Center', href: '/', icon: LayoutDashboard },
  { name: 'Resources', href: '/resources', icon: Package },
  { name: 'Energy', href: '/energy', icon: Zap },
  { name: 'Water', href: '/water', icon: Droplets },
  { name: 'Environment', href: '/environment', icon: Thermometer },
  { name: 'Food Production', href: '/food-production', icon: Sprout },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Automations', href: '/automations', icon: Bot },
  { name: 'Protocols', href: '/protocols', icon: FileText },
  { name: 'Finance', href: '/finance', icon: DollarSign },
  { name: 'Timeline', href: '/timeline', icon: Clock },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <span className="text-sidebar-primary-foreground font-bold text-sm">A</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm tracking-tight">Alona OS</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 text-sidebar-muted hover:text-sidebar-foreground transition-colors rounded-md hover:bg-sidebar-accent/50"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Collapse</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
