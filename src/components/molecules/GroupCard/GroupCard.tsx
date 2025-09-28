import React from 'react'
import { Group } from '@/types'
import { Users, MessageSquare, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

export interface GroupCardProps {
  group: Group
  isActive?: boolean
  onClick: () => void
  viewMode?: 'grid' | 'list'
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  isActive,
  onClick,
  viewMode = 'grid'
}) => {
  const getGroupAvatar = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500'
    ]
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  if (viewMode === 'list') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full text-left p-4 rounded-lg transition-colors border',
          isActive
            ? 'bg-blue-50 border-blue-200'
            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
        )}
      >
        <div className="flex items-center space-x-4">
          <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', getGroupAvatar(group.name))}>
            <span className="text-white font-semibold text-lg">
              {group.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
              <p className="text-sm text-gray-500">
                {formatDate(group.updatedAt)}
              </p>
            </div>
            {group.description && (
              <p className="text-sm text-gray-600 truncate mt-1">{group.description}</p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                {group._count?.members || 0} members
              </div>
              <div className="flex items-center">
                <MessageSquare className="w-3 h-3 mr-1" />
                {group._count?.messages || 0} messages
              </div>
            </div>
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-6 rounded-xl transition-all duration-200 border',
        isActive
          ? 'bg-blue-50 border-blue-200 shadow-sm'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
      )}
    >
      <div className="flex items-start space-x-4">
        <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center shadow-sm', getGroupAvatar(group.name))}>
          <span className="text-white font-bold text-xl">
            {group.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
            {group.name}
          </h3>
          {group.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {group.description}
            </p>
          )}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-3 text-gray-500">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {group._count?.members || 0}
              </div>
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                {group._count?.messages || 0}
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Updated {formatDate(group.updatedAt)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Activity indicator */}
      {group._count?.messages && group._count.messages > 0 && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></div>
      )}
    </button>
  )
}

export { GroupCard }