import React from 'react'
import { Hash } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SidebarItem {
  key: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  count: number
}

interface SidebarProps {
  isCollapsed: boolean
  activeSection: string
  items: SidebarItem[]
  onSectionChange: (section: string) => void
  children: React.ReactNode
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  activeSection,
  items,
  onSectionChange,
  children
}) => {
  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 h-[73px] flex items-center justify-center">
        <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Hash className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-gray-800">GroupChat</h1>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.key
            return (
              <button
                key={item.key}
                onClick={() => onSectionChange(item.key)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-3' : 'justify-between px-3'} py-2 rounded-lg text-left transition-colors relative ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-blue-50'
                }`}
                title={isCollapsed ? item.title : undefined}
              >
                <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.title}</span>
                  )}
                </div>
                {!isCollapsed && item.count > 0 && (
                  <Badge variant="default" className="bg-blue-600 text-white">
                    {item.count}
                  </Badge>
                )}
                {isCollapsed && item.count > 0 && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* User Profile Area */}
      <div className="p-4 border-t border-gray-200">
        {children}
      </div>
    </div>
  )
}