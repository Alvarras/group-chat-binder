'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Settings } from 'lucide-react'
import { useSupabase } from '@/lib/supabase/auth-provider'
import { showSuccessToast, showErrorToast } from '@/lib/toast'

interface User {
  id: string
  username: string
  email: string
  avatarUrl?: string
}

interface ProfileEditDialogProps {
  onProfileUpdate?: (user: User) => void
}

// Pre-defined avatar options
const AVATAR_OPTIONS = [
  'https://ui-avatars.com/api/?name=Avatar+1&background=3B82F6&color=fff&size=200',
  'https://ui-avatars.com/api/?name=Avatar+2&background=10B981&color=fff&size=200',
  'https://ui-avatars.com/api/?name=Avatar+3&background=F59E0B&color=fff&size=200',
  'https://ui-avatars.com/api/?name=Avatar+4&background=EF4444&color=fff&size=200',
  'https://ui-avatars.com/api/?name=Avatar+5&background=8B5CF6&color=fff&size=200',
  'https://ui-avatars.com/api/?name=Avatar+6&background=F97316&color=fff&size=200',
  'https://ui-avatars.com/api/?name=Avatar+7&background=06B6D4&color=fff&size=200',
  'https://ui-avatars.com/api/?name=Avatar+8&background=84CC16&color=fff&size=200',
  'https://ui-avatars.com/api/?name=Avatar+9&background=EC4899&color=fff&size=200',
  'https://ui-avatars.com/api/?name=Avatar+10&background=6366F1&color=fff&size=200'
]

export function ProfileEditDialog({ onProfileUpdate }: ProfileEditDialogProps) {
  const { user } = useSupabase()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Fetch current user data when dialog opens
  useEffect(() => {
    if (open && user?.id) {
      fetchUserProfile()
    }
  }, [open, user?.id])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const user = await response.json()
        setCurrentUser(user)
        setUsername(user.username || '')
        setSelectedAvatar(user.avatarUrl || AVATAR_OPTIONS[0])
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleSave = async () => {
    if (!username.trim()) {
      showErrorToast('Username is required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim(),
          avatarUrl: selectedAvatar
        })
      })

      if (response.ok) {
        const updatedUser = await response.json()
        
        setCurrentUser(updatedUser)
        onProfileUpdate?.(updatedUser)
        setOpen(false)
        showSuccessToast('Profile updated successfully!')
      } else {
        const error = await response.json()
        showErrorToast(error.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showErrorToast('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Avatar Selection */}
          <div className="space-y-3">
            <Label>Choose Avatar</Label>
            <div className="grid grid-cols-5 gap-3">
              {AVATAR_OPTIONS.map((avatarUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAvatar(avatarUrl)}
                  className={`p-1 rounded-full transition-all ${
                    selectedAvatar === avatarUrl 
                      ? 'ring-2 ring-blue-500 ring-offset-2' 
                      : 'hover:ring-2 hover:ring-gray-300'
                  }`}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={avatarUrl} alt={`Avatar ${index + 1}`} />
                    <AvatarFallback>{index + 1}</AvatarFallback>
                  </Avatar>
                </button>
              ))}
            </div>
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Avatar>
                <AvatarImage src={selectedAvatar} alt="Profile preview" />
                <AvatarFallback>
                  {username.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{username || 'Username'}</p>
                <p className="text-sm text-gray-500">{currentUser?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !username.trim()}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}