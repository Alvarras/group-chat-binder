import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'

interface FriendRequestCardProps {
  id: string
  fromUser: {
    id: string
    username: string
    email: string
    avatarUrl?: string
  }
  createdAt: string
  onAccept: (id: string) => void
  onDecline: (id: string) => void
}

export const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  id,
  fromUser,
  createdAt,
  onAccept,
  onDecline
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage 
              src={fromUser.avatarUrl || `https://ui-avatars.com/api/?name=${fromUser.username}&background=3B82F6&color=fff`} 
              alt={fromUser.username}
            />
            <AvatarFallback>
              {fromUser.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{fromUser.username}</h3>
            <p className="text-sm text-gray-500">{fromUser.email}</p>
            <p className="text-xs text-gray-400">
              {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAccept(id)}
            className="text-green-600 border-green-300 hover:bg-green-50"
          >
            <Check className="w-4 h-4 mr-1" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDecline(id)}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-1" />
            Decline
          </Button>
        </div>
      </div>
    </div>
  )
}