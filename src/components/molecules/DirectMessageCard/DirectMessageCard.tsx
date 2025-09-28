import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface DirectMessageCardProps {
  user: {
    id: string
    username: string
    avatarUrl?: string
  }
  lastMessage?: {
    content: string
    createdAt: string
  }
  unreadCount: number
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

export const DirectMessageCard: React.FC<DirectMessageCardProps> = ({
  user,
  lastMessage,
  unreadCount,
  onClick
}) => {
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar>
              <AvatarImage 
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=3B82F6&color=fff`}
                alt={user.username}
              />
              <AvatarFallback>
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{user.username}</h3>
            <p className="text-sm text-gray-500">
              {lastMessage ? lastMessage.content : 'No messages yet'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {lastMessage && (
            <span className="text-xs text-gray-500">
              {formatTime(lastMessage.createdAt)}
            </span>
          )}
          {unreadCount > 0 && (
            <Badge variant="default" className="bg-blue-600 text-white">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}