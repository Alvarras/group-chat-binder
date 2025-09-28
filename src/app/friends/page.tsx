'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/supabase/auth-provider'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/atoms/Button/Button'
import { Input } from '@/components/atoms/Input/Input'
import { Modal } from '@/components/atoms/Modal/Modal'
import { Avatar } from '@/components/atoms/Avatar/Avatar'
import { useRouter } from 'next/navigation'
import { showSuccessToast, showErrorToast } from '@/lib/toast'

interface Friend {
  id: string
  username: string
  email: string
  avatarUrl?: string
  status?: string
  mutualFriends?: number
}

interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  status: string
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

export default function FriendsPage() {
  const { user } = useSupabase()
  const router = useRouter()
  
  const [friends, setFriends] = useState<Friend[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showAddFriendModal, setShowAddFriendModal] = useState(false)
  const [friendSearchValue, setFriendSearchValue] = useState('')
  const [isAddingFriend, setIsAddingFriend] = useState(false)
  
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'sent'>('all')

  useEffect(() => {
    if (user) {
      fetchFriendsData()
    }
  }, [user])

  const fetchFriendsData = async () => {
    try {
      setLoading(true)
      const [friendsRes, sentRes, receivedRes] = await Promise.all([
        fetch('/api/friends'),
        fetch('/api/friend-requests?type=sent'),
        fetch('/api/friend-requests?type=received')
      ])
      
      if (friendsRes.ok) {
        const friendsData = await friendsRes.json()
        // Handle the response format from API
        const friendsArray = friendsData.friends || []
        setFriends(friendsArray.map((friend: any) => ({
          id: friend.id,
          username: friend.username,
          email: friend.email,
          avatarUrl: friend.avatarUrl,
          status: friend.status || 'offline',
          mutualFriends: friend.mutualFriends || 0
        })))
      }

      if (sentRes.ok) {
        const sentData = await sentRes.json()
        setSentRequests(sentData || [])
      }

      if (receivedRes.ok) {
        const receivedData = await receivedRes.json()
        setReceivedRequests(receivedData || [])
      }
    } catch (error) {
      console.error('Error fetching friends data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addFriend = async () => {
    if (!friendSearchValue.trim()) return
    
    setIsAddingFriend(true)
    try {
      const response = await fetch('/api/friend-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: friendSearchValue.trim() })
      })
      
      if (response.ok) {
        setFriendSearchValue('')
        setShowAddFriendModal(false)
        fetchFriendsData() // Refresh data
        showErrorToast('Friend request sent successfully!')
      } else {
        const error = await response.json()
        showErrorToast(error.error || 'Failed to send friend request')
      }
    } catch (error) {
      console.error('Error adding friend:', error)
      showErrorToast('Failed to send friend request')
    } finally {
      setIsAddingFriend(false)
    }
  }

  const respondToFriendRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/friend-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      if (response.ok) {
        fetchFriendsData() // Refresh to show new friend or remove request
        showErrorToast(`Friend request ${action}ed successfully!`)
      } else {
        showErrorToast(`Failed to ${action} friend request`)
      }
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error)
      showErrorToast(`Failed to ${action} friend request`)
    }
  }

  const startDirectMessage = async (friendId: string) => {
    try {
      const response = await fetch('/api/direct-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: friendId })
      })
      
      if (response.ok) {
        router.push('/direct-messages')
      } else {
        showErrorToast('Failed to create chat')
      }
    } catch (error) {
      console.error('Error creating direct message:', error)
      showErrorToast('Failed to create chat')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600 font-medium">Loading friends...</div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Friends</h1>
          <Button
            onClick={() => setShowAddFriendModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md"
          >
            + Add Friend
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'all' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'pending' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'sent' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sent ({sentRequests.length})
          </button>
        </div>

        {/* All Friends Tab */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            {friends.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No friends yet</h3>
                <p className="text-gray-600">Add some friends to get started!</p>
              </div>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar src={friend.avatarUrl} alt={friend.username} size="md" />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{friend.username}</h3>
                        <p className="text-gray-600 text-sm">{friend.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className={`w-2 h-2 rounded-full ${
                            friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          <span className="text-xs text-gray-500 font-medium">
                            {friend.status === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => startDirectMessage(friend.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                      >
                        💬 Start Chat
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pending Requests Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {receivedRequests.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">📨</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                <p className="text-gray-600">Friend requests will appear here</p>
              </div>
            ) : (
              receivedRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar src={request.fromUser.avatarUrl} alt={request.fromUser.username} size="md" />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{request.fromUser.username}</h3>
                        <p className="text-gray-600 text-sm">{request.fromUser.email}</p>
                        <p className="text-gray-500 text-xs mt-1 font-medium">
                          📅 Sent {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => respondToFriendRequest(request.id, 'accept')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                      >
                        ✓ Accept
                      </Button>
                      <Button
                        onClick={() => respondToFriendRequest(request.id, 'decline')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                      >
                        ✗ Decline
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Sent Requests Tab */}
        {activeTab === 'sent' && (
          <div className="space-y-4">
            {sentRequests.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">📤</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sent requests</h3>
                <p className="text-gray-600">Requests you send will appear here</p>
              </div>
            ) : (
              sentRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar src={request.toUser.avatarUrl} alt={request.toUser.username} size="md" />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{request.toUser.username}</h3>
                        <p className="text-gray-600 text-sm">{request.toUser.email}</p>
                        <p className="text-gray-500 text-xs mt-1 font-medium">
                          📅 Sent {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full border border-yellow-200">
                        ⏳ Pending
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add Friend Modal */}
        <Modal
          isOpen={showAddFriendModal}
          onClose={() => setShowAddFriendModal(false)}
          title="Add New Friend"
        >
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-3">👋</div>
              <p className="text-gray-600">Enter a username or email to send a friend request</p>
            </div>
            
            <Input
              value={friendSearchValue}
              onChange={(e) => setFriendSearchValue(e.target.value)}
              placeholder="Enter username or email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            <div className="flex space-x-3">
              <Button
                onClick={addFriend}
                disabled={isAddingFriend || !friendSearchValue.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium shadow-sm"
              >
                {isAddingFriend ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  '📤 Send Request'
                )}
              </Button>
              <Button
                onClick={() => setShowAddFriendModal(false)}
                variant="secondary"
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  )
}