import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'

interface FriendCardProps {
  friend: {
    id: string
    username: string
    email: string
    avatarUrl?: string
    status: string
  }
  onMessage: (id: string) => void
}

export const FriendCard: React.FC<FriendCardProps> = ({ friend, onMessage }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage 
              src={friend.avatarUrl || `https://ui-avatars.com/api/?name=${friend.username}&background=3B82F6&color=fff`}
              alt={friend.username}
            />
            <AvatarFallback>
              {friend.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-900">{friend.username}</h3>
            <p className="text-sm text-gray-500">{friend.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMessage(friend.id)}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Message
          </Button>
          <span className={`w-2 h-2 rounded-full ${
            friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
          }`}></span>
        </div>
      </div>
    </div>
  )
}