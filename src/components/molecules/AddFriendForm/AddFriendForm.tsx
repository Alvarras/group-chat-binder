import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus } from 'lucide-react'

interface AddFriendFormProps {
  email: string
  onEmailChange: (email: string) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
}

export const AddFriendForm: React.FC<AddFriendFormProps> = ({
  email,
  onEmailChange,
  onSubmit,
  isLoading
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Add New Friend</h3>
      <form onSubmit={onSubmit} className="flex space-x-3">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="Enter friend's email address"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          disabled={isLoading || !email.trim()}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Send Request
            </>
          )}
        </Button>
      </form>
    </div>
  )
}