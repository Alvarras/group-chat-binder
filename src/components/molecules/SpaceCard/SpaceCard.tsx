import React from 'react'
import { Hash } from 'lucide-react'

interface SpaceCardProps {
  id: string
  name: string
  memberCount: number
  messageCount: number
  updatedAt: string
  onClick: () => void
}

const formatTime = (date: string) => {
  const now = new Date()
  const messageDate = new Date(date)
  const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'now'
  if (diffInMinutes < 60) return `${diffInMinutes}m`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
  return `${Math.floor(diffInMinutes / 1440)}d`
}

export const SpaceCard: React.FC<SpaceCardProps> = ({
  name,
  memberCount,
  messageCount,
  updatedAt,
  onClick
}) => {
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Hash className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">
              {memberCount} members • {messageCount} messages
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">{formatTime(updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}