'use client'

import React, { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/supabase/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ProfileEditDialog } from '@/components/ProfileEditDialog'
import { 
  SectionHeader,
  EmptyState,
  SpaceCard,
  DirectMessageCard,
  FriendRequestCard,
  FriendCard,
  AddFriendForm,
  Sidebar
} from '@/components'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import { 
  Hash,
  MessageSquare, 
  Bell,
  Users,
  User,
  LogOut,
  Plus,
  Search,
  Settings,
  MoreHorizontal,
  X,
  Menu
} from 'lucide-react'

interface Group {
  id: string
  name: string
  description?: string
  creator: {
    id: string
    username: string
    avatarUrl?: string
  }
  _count: {
    members: number
    messages: number
  }
  updatedAt: string
}

interface DirectMessageConversation {
  id: string
  user: {
    id: string
    username: string
    email: string
    avatarUrl?: string
  }
  lastMessage?: {
    id: string
    content: string
    createdAt: string
    read: boolean
  }
  unreadCount: number
}

interface Friend {
  id: string
  username: string
  email: string
  avatarUrl?: string
  status: string
}

interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  createdAt: string
  fromUser: {
    id: string
    username: string
    email: string
    avatarUrl?: string
  }
  toUser: {
    id: string
    username: string
    email: string
    avatarUrl?: string
  }
}

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useSupabase()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('spaces')
  const [groups, setGroups] = useState<Group[]>([])
  const [directMessages, setDirectMessages] = useState<DirectMessageConversation[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [addFriendEmail, setAddFriendEmail] = useState('')
  const [isAddingFriend, setIsAddingFriend] = useState(false)
  const [showCreateSpaceModal, setShowCreateSpaceModal] = useState(false)
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [newSpaceName, setNewSpaceName] = useState('')
  const [newSpaceDescription, setNewSpaceDescription] = useState('')
  const [isCreatingSpace, setIsCreatingSpace] = useState(false)
  const [userProfile, setUserProfile] = useState({
    username: user?.user_metadata?.username || '',
    avatarUrl: user?.user_metadata?.avatar_url || ''
  })

  const sidebarItems = [
    {
      key: 'spaces',
      title: 'Spaces',
      icon: Hash,
      count: 0 // Will be updated with real data
    },
    {
      key: 'direct-messages',
      title: 'Direct Messages',
      icon: MessageSquare,
      count: directMessages.reduce((acc, dm) => acc + dm.unreadCount, 0)
    },
    {
      key: 'activity',
      title: 'Activity',
      icon: Bell,
      count: friendRequests.length
    },
    {
      key: 'friends',
      title: 'Friends',
      icon: Users,
      count: 0
    }
  ]

  // Filter functions
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredDirectMessages = directMessages.filter(dm => 
    dm.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dm.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredFriends = friends.filter(friend => 
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredFriendRequests = friendRequests.filter(request => 
    request.fromUser.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.fromUser.email.toLowerCase().includes(searchQuery.toLowerCase())
  )  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return

      try {
        setLoading(true)

        // Fetch groups
        const groupsRes = await fetch('/api/groups')
        if (groupsRes.ok) {
          const groupsData = await groupsRes.json()
          setGroups(groupsData)
        }

        // Fetch direct messages
        const dmRes = await fetch('/api/direct-messages')
        if (dmRes.ok) {
          const dmData = await dmRes.json()
          setDirectMessages(dmData.conversations || [])
        }

        // Fetch friends
        const friendsRes = await fetch('/api/friends')
        if (friendsRes.ok) {
          const friendsData = await friendsRes.json()
          setFriends(friendsData.friends || [])
        }

        // Fetch friend requests
        const friendRequestsRes = await fetch('/api/friend-requests?type=received')
        if (friendRequestsRes.ok) {
          const requestsData = await friendRequestsRes.json()
          setFriendRequests(requestsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Sync user profile with user data
  useEffect(() => {
    if (user) {
      setUserProfile({
        username: user.user_metadata?.username || '',
        avatarUrl: user.user_metadata?.avatar_url || ''
      })
    }
  }, [user])

  // Helper functions
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addFriendEmail.trim()) return

    setIsAddingFriend(true)
    try {
      const response = await fetch('/api/friend-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: addFriendEmail })
      })

      if (response.ok) {
        setAddFriendEmail('')
        showSuccessToast('Friend request sent successfully!')
      } else {
        const error = await response.json()
        showErrorToast(error.error || 'Failed to send friend request')
      }
    } catch (error) {
      console.error('Error sending friend request:', error)
      showErrorToast('Failed to send friend request')
    } finally {
      setIsAddingFriend(false)
    }
  }

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/friend-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        // Refresh friend requests and friends list
        const friendRequestsRes = await fetch('/api/friend-requests?type=received')
        if (friendRequestsRes.ok) {
          const requestsData = await friendRequestsRes.json()
          setFriendRequests(requestsData)
        }
        
        if (action === 'accept') {
          const friendsRes = await fetch('/api/friends')
          if (friendsRes.ok) {
            const friendsData = await friendsRes.json()
            setFriends(friendsData.friends || [])
          }
          showSuccessToast('Friend request accepted!')
        } else {
          showSuccessToast('Friend request declined!')
        }
      } else {
        const error = await response.json()
        showErrorToast(error.error || 'Failed to handle friend request')
      }
    } catch (error) {
      console.error('Error handling friend request:', error)
      showErrorToast('Failed to handle friend request')
    }
  }

  const handleProfileUpdate = (updatedUser: any) => {
    setUserProfile({
      username: updatedUser.username,
      avatarUrl: updatedUser.avatarUrl
    })
  }

  // Handle redirect after logout
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [authLoading, user, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      // Navigation will be handled by useEffect above
    } catch (error) {
      console.error('Error signing out:', error)
      showErrorToast('Failed to sign out')
    }
  }

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSpaceName.trim() || isCreatingSpace) return

    setIsCreatingSpace(true)
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newSpaceName.trim(),
          description: newSpaceDescription.trim()
        })
      })

      if (response.ok) {
        const newSpace = await response.json()
        setGroups(prev => [newSpace, ...prev])
        setNewSpaceName('')
        setNewSpaceDescription('')
        setShowCreateSpaceModal(false)
        showSuccessToast('Space created successfully!')
      } else {
        const error = await response.json()
        showErrorToast(error.error || 'Failed to create space')
      }
    } catch (error) {
      console.error('Error creating space:', error)
      showErrorToast('Failed to create space')
    } finally {
      setIsCreatingSpace(false)
    }
  }

  const handleNewMessage = (friendId: string) => {
    router.push(`/direct-messages?userId=${friendId}`)
    setShowNewMessageModal(false)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    switch (activeSection) {
      case 'spaces':
        return (
          <div className="space-y-4">
            <SectionHeader
              title="Spaces"
              searchResults={searchQuery ? {
                count: filteredGroups.length,
                query: searchQuery
              } : undefined}
              actionButton={{
                label: "Create Space",
                icon: Plus,
                onClick: () => setShowCreateSpaceModal(true)
              }}
            />
            <div className="space-y-2">
              {filteredGroups.length === 0 ? (
                <EmptyState
                  icon={Hash}
                  title={searchQuery ? `No spaces found for "${searchQuery}"` : 'No spaces yet'}
                  description={searchQuery ? 'Try a different search term' : 'Create your first space to get started!'}
                />
              ) : (
                filteredGroups.map((group) => (
                  <SpaceCard
                    key={group.id}
                    id={group.id}
                    name={group.name}
                    memberCount={group._count.members}
                    messageCount={group._count.messages}
                    updatedAt={group.updatedAt}
                    onClick={() => router.push(`/spaces/${group.id}/chat`)}
                  />
                ))
              )}
            </div>
          </div>
        )
      
      case 'direct-messages':
        return (
          <div className="space-y-4">
            <SectionHeader
              title="Direct Messages"
              searchResults={searchQuery ? {
                count: filteredDirectMessages.length,
                query: searchQuery
              } : undefined}
              actionButton={{
                label: "New Message",
                icon: Plus,
                onClick: () => setShowNewMessageModal(true)
              }}
            />
            <div className="space-y-2">
              {filteredDirectMessages.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title={searchQuery ? `No messages found for "${searchQuery}"` : 'No direct messages yet'}
                  description={searchQuery ? 'Try a different search term' : 'Start a conversation with a friend!'}
                />
              ) : (
                filteredDirectMessages.map((dm) => (
                  <DirectMessageCard
                    key={dm.id}
                    user={dm.user}
                    lastMessage={dm.lastMessage}
                    unreadCount={dm.unreadCount}
                    onClick={() => router.push(`/direct-messages?userId=${dm.user.id}`)}
                  />
                ))
              )}
            </div>
          </div>
        )
      
      case 'activity':
        return (
          <div className="space-y-4">
            <SectionHeader
              title="Activity"
              searchResults={searchQuery ? {
                count: filteredFriendRequests.length,
                query: searchQuery
              } : undefined}
            />
            <div className="space-y-3">
              {loading ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : filteredFriendRequests.length > 0 ? (
                filteredFriendRequests.map((request) => (
                  <FriendRequestCard
                    key={request.id}
                    id={request.id}
                    fromUser={request.fromUser}
                    createdAt={request.createdAt}
                    onAccept={(id) => handleFriendRequest(id, 'accept')}
                    onDecline={(id) => handleFriendRequest(id, 'decline')}
                  />
                ))
              ) : (
                <EmptyState
                  icon={Bell}
                  title="No friend requests"
                  description="You're all caught up!"
                />
              )}
            </div>
          </div>
        )
      
      case 'friends':
        return (
          <div className="space-y-4">
            <SectionHeader
              title="Friends"
              searchResults={searchQuery ? {
                count: filteredFriends.length,
                query: searchQuery
              } : undefined}
            />

            <AddFriendForm
              email={addFriendEmail}
              onEmailChange={setAddFriendEmail}
              onSubmit={handleAddFriend}
              isLoading={isAddingFriend}
            />

            <div className="space-y-2">
              {filteredFriends.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={searchQuery ? `No friends found for "${searchQuery}"` : 'No friends yet'}
                  description={searchQuery ? 'Try a different search term' : 'Start building your network!'}
                />
              ) : (
                filteredFriends.map((friend) => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    onMessage={(id) => router.push(`/direct-messages?userId=${id}`)}
                  />
                ))
              )}
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        activeSection={activeSection}
        items={sidebarItems}
        onSectionChange={(section) => {
          setActiveSection(section)
          setSearchQuery('') // Reset search when changing sections
        }}
      >
        {/* User Profile */}
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center space-y-3">
            <Avatar>
              <AvatarImage 
                src={userProfile.avatarUrl || `https://ui-avatars.com/api/?name=${userProfile.username || user?.email || 'User'}&background=3B82F6&color=fff`}
                alt={userProfile.username || user?.email || 'User'}
              />
              <AvatarFallback>
                {(userProfile.username || user?.email || 'User').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <ProfileEditDialog onProfileUpdate={handleProfileUpdate} />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="text-gray-500 hover:text-red-600 p-2"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage 
                  src={userProfile.avatarUrl || `https://ui-avatars.com/api/?name=${userProfile.username || user?.email || 'User'}&background=3B82F6&color=fff`}
                  alt={userProfile.username || user?.email || 'User'}
                />
                <AvatarFallback>
                  {(userProfile.username || user?.email || 'User').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userProfile.username || user?.email || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <ProfileEditDialog onProfileUpdate={handleProfileUpdate} />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-gray-500 hover:text-red-600"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 h-[73px] flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </div>

      {/* Create Space Modal */}
      <Dialog open={showCreateSpaceModal} onOpenChange={setShowCreateSpaceModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Space</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSpace} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spaceName">Space Name *</Label>
              <Input
                id="spaceName"
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                placeholder="Enter space name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spaceDescription">Description</Label>
              <Textarea
                id="spaceDescription"
                value={newSpaceDescription}
                onChange={(e) => setNewSpaceDescription(e.target.value)}
                placeholder="Enter space description (optional)"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateSpaceModal(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!newSpaceName.trim() || isCreatingSpace}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreatingSpace ? 'Creating...' : 'Create Space'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Message Modal */}
      <Dialog open={showNewMessageModal} onOpenChange={setShowNewMessageModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start New Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select a friend to message</Label>
              <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
                {friends.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No friends yet</p>
                    <p className="text-sm">Add friends to start messaging!</p>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleNewMessage(friend.id)}
                    >
                      <Avatar>
                        <AvatarImage src={friend.avatarUrl} />
                        <AvatarFallback>
                          {friend.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{friend.username}</p>
                        <p className="text-sm text-gray-500">{friend.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowNewMessageModal(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
