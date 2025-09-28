'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/supabase/auth-provider'
import { useRouter, useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { ChatLayout, ChatHeader, ChatMessagesArea, ChatInput } from '@/components/organisms/ChatLayout'
import { EmptyState } from '@/components/atoms/EmptyState/EmptyState'
import { User, DirectMessage } from '@/types'
import { formatMessageTime } from '@/lib/utils'
import { MessageSquare, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/atoms/Button/Button'
import { showSuccessToast, showErrorToast } from '@/lib/toast'

export default function DirectMessagesPage() {
  const { user } = useSupabase()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)

  const fetchUserInfo = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const user = await response.json()
        setSelectedUser(user)
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  const fetchMessages = async (userId: string) => {
    setMessagesLoading(true)
    try {
      const response = await fetch(`/api/direct-messages/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        showErrorToast('Gagal memuat pesan')
        setMessages([])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      showErrorToast('Terjadi error saat memuat pesan')
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }

  // Get userId from URL params and set selected conversation
  useEffect(() => {
    const userId = searchParams?.get('userId')
    if (userId) {
      setSelectedUserId(userId)
      fetchUserInfo(userId)
      fetchMessages(userId)
    } else {
      // If no userId in params, redirect to dashboard immediately
      router.replace('/dashboard')
    }
  }, [searchParams, router])

  // If no userId selected, show loading while redirecting
  if (!selectedUserId || !selectedUser) {
    return (
      <MainLayout>
        <div className="bg-white rounded-lg shadow-sm h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUserId || sendingMessage) return

    setSendingMessage(true)
    try {
      const response = await fetch('/api/direct-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedUserId,
          content: newMessage.trim(),
          type: 'TEXT'
        })
      })

      if (response.ok) {
        const message = await response.json()
        setMessages(prev => [...prev, message])
        setNewMessage('')
        showSuccessToast('Pesan terkirim!')
      } else {
        const error = await response.json()
        showErrorToast(error.error || 'Gagal mengirim pesan')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      showErrorToast('Terjadi error saat mengirim pesan')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e as any)
    }
  }

  const goBackToDashboard = () => {
    router.push('/dashboard')
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="bg-white rounded-lg shadow-sm h-screen flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Please sign in</h3>
            <p className="text-gray-500">You need to sign in to access direct messages</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <ChatLayout>
        <ChatHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={goBackToDashboard}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                {selectedUser.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedUser.username}
                </h3>
                <div className="text-sm text-green-600 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Online
                </div>
              </div>
            </div>
          </div>
        </ChatHeader>

        <ChatMessagesArea>
          {messagesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex justify-start">
                    <div className="bg-gray-200 rounded-lg p-3 max-w-xs">
                      <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <EmptyState
                icon={MessageSquare}
                title="Belum ada pesan"
                description="Mulai percakapan dengan mengirim pesan pertama!"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.senderId === user?.id
                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl shadow-sm ${
                      isOwn 
                        ? 'bg-blue-500 text-white rounded-br-sm' 
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        isOwn ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ChatMessagesArea>

        <ChatInput
          value={newMessage}
          onChange={setNewMessage}
          onSubmit={sendMessage}
          placeholder="Type a message..."
          disabled={sendingMessage}
          loading={sendingMessage}
        />
      </ChatLayout>
    </MainLayout>
  )
}
