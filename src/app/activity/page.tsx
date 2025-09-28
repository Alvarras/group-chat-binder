'use client'

import React, { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/supabase/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/atoms/Button/Button'
import { Avatar } from '@/components/atoms/Avatar/Avatar'
import { ArrowLeft, Bell, Users, MessageSquare, Check, X } from 'lucide-react'
import { getTimeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  type: 'FRIEND_REQUEST' | 'GROUP_INVITE' | 'MESSAGE' | 'MENTION'
  title: string
  message: string
  createdAt: string | Date // Can be string from API or Date object
  read: boolean
  actionable?: boolean
  fromUser?: {
    id: string
    username: string
    avatarUrl?: string
  }
  relatedId?: string // friend request ID, group ID, etc.
}

export default function ActivityPage() {
  const { user, loading: authLoading } = useSupabase()
  const router = useRouter()
  
  // Data State
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'friend_requests'>('all')

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications')
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      } else {
        toast.error('Failed to fetch notifications')
      }
    } catch (error) {
      toast.error('Error fetching notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // TODO: Implement API call to mark as read
      // await fetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' })
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      )
    } catch (error) {
      toast.error('Error marking notification as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      // TODO: Implement API call to mark all as read
      // await fetch('/api/notifications/read-all', { method: 'PATCH' })
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      )
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Error marking all notifications as read')
    }
  }

  const handleFriendRequest = async (notificationId: string, requestId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/friend-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        // Remove notification after action
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
        toast.success(`Friend request ${action}ed!`)
      } else {
        const error = await response.json()
        toast.error(error.error || `Error ${action}ing friend request`)
      }
    } catch (error) {
      toast.error(`Error ${action}ing friend request`)
    }
  }

  const handleGroupInvite = async (notificationId: string, groupId: string, action: 'accept' | 'decline') => {
    try {
      // TODO: Implement API call to handle group invite
      // await fetch(`/api/groups/${groupId}/invites`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ action })
      // })

      // Remove notification after action
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
      toast.success(`Group invitation ${action}ed!`)
      
      if (action === 'accept') {
        router.push(`/spaces/${groupId}/chat`)
      }
    } catch (error) {
      toast.error(`Error ${action}ing group invitation`)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id)
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'MESSAGE':
        if (notification.relatedId) {
          router.push(`/dm/${notification.fromUser?.id}`)
        }
        break
      case 'MENTION':
        if (notification.relatedId) {
          router.push(`/spaces/${notification.relatedId}/chat`)
        }
        break
    }
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread':
        return !notif.read
      case 'friend_requests':
        return notif.type === 'FRIEND_REQUEST'
      default:
        return true
    }
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST':
        return <Users className="w-5 h-5 text-blue-500" />
      case 'GROUP_INVITE':
        return <Users className="w-5 h-5 text-green-500" />
      case 'MESSAGE':
        return <MessageSquare className="w-5 h-5 text-purple-500" />
      case 'MENTION':
        return <Bell className="w-5 h-5 text-orange-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  if (authLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBackToDashboard} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Activity</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {unreadCount > 0 && (
              <Button variant="secondary" onClick={handleMarkAllAsRead}>
                Mark All Read
              </Button>
            )}
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex space-x-8 mt-4">
          <button
            onClick={() => setFilter('all')}
            className={`pb-2 border-b-2 transition-colors ${
              filter === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`pb-2 border-b-2 transition-colors ${
              filter === 'unread'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('friend_requests')}
            className={`pb-2 border-b-2 transition-colors ${
              filter === 'friend_requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Friend Requests ({notifications.filter(n => n.type === 'FRIEND_REQUEST').length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {filter === 'unread' ? 'No unread notifications' :
               filter === 'friend_requests' ? 'No friend requests' :
               'No notifications'}
            </h3>
            <p className="text-gray-500">
              {filter === 'unread' ? 'You\'re all caught up!' :
               filter === 'friend_requests' ? 'No pending friend requests.' :
               'We\'ll notify you when something happens.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer ${
                  !notification.read ? 'border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => !notification.actionable && handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                        <span>{getTimeAgo(notification.createdAt)}</span>
                        {notification.fromUser && (
                          <div className="flex items-center space-x-2">
                            <Avatar
                              size="xs"
                              fallback={notification.fromUser.username[0]?.toUpperCase() || 'U'}
                              src={notification.fromUser.avatarUrl}
                            />
                            <span>{notification.fromUser.username}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons for actionable notifications */}
                  {notification.actionable && notification.type === 'FRIEND_REQUEST' && (
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFriendRequest(notification.id, notification.relatedId || '', 'accept')
                        }}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFriendRequest(notification.id, notification.relatedId || '', 'decline')
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  )}

                  {notification.actionable && notification.type === 'GROUP_INVITE' && (
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGroupInvite(notification.id, notification.relatedId || '', 'accept')
                        }}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGroupInvite(notification.id, notification.relatedId || '', 'decline')
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}