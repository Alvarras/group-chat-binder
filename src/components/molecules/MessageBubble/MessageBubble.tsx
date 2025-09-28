import React from 'react'
import { Avatar } from '@/components/atoms/Avatar/Avatar'
import { Message } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

export interface MessageBubbleProps {
  message: Message & { 
    timestamp?: string 
  }
  isOwn: boolean
  showAvatar?: boolean
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true
}) => {
  return (
    <div className={cn(
      'flex items-start space-x-3',
      isOwn && 'justify-end'
    )}>
      {!isOwn && showAvatar && (
        <Avatar
          size="sm"
          fallback={message.user?.username?.[0]?.toUpperCase() || 'U'}
          src={message.user?.avatarUrl}
        />
      )}
      
      <div className={cn(
        'max-w-xs lg:max-w-md',
        isOwn && 'order-first'
      )}>
        {!isOwn && showAvatar && (
          <p className="text-xs font-medium text-gray-600 mb-1">
            {message.user?.username}
          </p>
        )}
        
        <div className={cn(
          'px-4 py-2 rounded-2xl',
          isOwn
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        )}>
          <p className="text-sm">{message.content}</p>
        </div>
        
        <p className={cn(
          'text-xs mt-1',
          isOwn ? 'text-right text-gray-500' : 'text-gray-500'
        )}>
          {message.timestamp || formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
        </p>
      </div>
      
      {isOwn && showAvatar && (
        <Avatar
          size="sm"
          fallback={message.user?.username?.[0]?.toUpperCase() || 'M'}
          src={message.user?.avatarUrl}
        />
      )}
    </div>
  )
}

export { MessageBubble }