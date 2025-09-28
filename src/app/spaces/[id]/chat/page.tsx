'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/supabase/auth-provider'
import { Button } from '@/components/atoms/Button/Button'
import { Input } from '@/components/atoms/Input/Input'
import { MessageBubble } from '@/components/molecules/MessageBubble/MessageBubble'
import { ChatLayout } from '@/components/organisms/ChatLayout/ChatLayout'
import { ChatHeader } from '@/components/organisms/ChatLayout/ChatHeader'
import { ChatMessagesArea } from '@/components/organisms/ChatLayout/ChatMessagesArea'
import { ChatInput } from '@/components/organisms/ChatLayout/ChatInput'
import { EmptyState } from '@/components/atoms/EmptyState/EmptyState'
import { Message, Group } from '@/types'
import { 
  Send, 
  FileText, 
  Settings,
  Users,
  Hash,
  MessageSquare,
  ArrowLeft,
  UserPlus,
  X
} from 'lucide-react'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import { formatMessageTime } from '@/lib/utils'

interface Member {
  id: string
  name: string
  email: string
}

export default function ChatPage() {
  const params = useParams()
  const groupId = params?.id as string
  const router = useRouter()
  const { user } = useSupabase()
  
  const [group, setGroup] = useState<Group | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [friends, setFriends] = useState<Member[]>([])
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [isAddingMember, setIsAddingMember] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (groupId && user?.id) {
      fetchGroupData()
      fetchMessages()
      fetchMembers()
      fetchFriends()
    }
  }, [groupId, user])

  const fetchGroupData = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`)
      if (response.ok) {
        const data = await response.json()
        setGroup(data)
      } else if (response.status === 403) {
        showErrorToast('Access denied')
        router.push('/dashboard')
      } else {
        showErrorToast('Failed to fetch group data')
      }
    } catch (error) {
      showErrorToast('Error fetching group data')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      setMessagesLoading(true)
      const response = await fetch(`/api/groups/${groupId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      } else if (response.status === 403) {
        showErrorToast('Access denied')
        router.push('/dashboard')
      } else {
        showErrorToast('Failed to fetch messages')
      }
    } catch (error) {
      showErrorToast('Error fetching messages')
    } finally {
      setMessagesLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      setMembers([]) // Ensure members is always an array on error
    }
  }

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends')
      if (response.ok) {
        const data = await response.json()
        const confirmedFriends = (data.friends || [])
          .map((f: any) => ({
            id: f.id,
            name: f.username,
            email: f.email
          }))
        setFriends(confirmedFriends)
      } else {
        setFriends([])
      }
    } catch (error) {
      console.error('Error fetching friends:', error)
      setFriends([])
    }
  }

  const addMemberToGroup = async (friendId: string) => {
    setIsAddingMember(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId: friendId })
      })

      if (response.ok) {
        await fetchMembers()
        setShowMemberModal(false)
        showSuccessToast('Anggota berhasil ditambahkan ke space!')
      } else {
        const error = await response.json()
        showErrorToast(error.error || 'Gagal menambahkan anggota')
      }
    } catch (error) {
      console.error('Error adding member:', error)
      showErrorToast('Terjadi error saat menambahkan anggota')
    } finally {
      setIsAddingMember(false)
    }
  }

  const removeMemberFromGroup = async (memberId: string) => {
    if (!confirm('Yakin ingin mengeluarkan member dari space?')) return

    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId })
      })

      if (response.ok) {
        await fetchMembers()
        showSuccessToast('Member berhasil dikeluarkan')
      } else {
        const error = await response.json()
        showErrorToast(error.error || 'Gagal mengeluarkan member')
      }
    } catch (error) {
      console.error('Error removing member:', error)
      showErrorToast('Terjadi error saat mengeluarkan member')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !groupId || sendingMessage) return

    setSendingMessage(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          messageType: 'TEXT'
        })
      })

      if (response.ok) {
        const message = await response.json()
        setMessages(prev => [...prev, message])
        setNewMessage('')
        showSuccessToast('Message sent!')
      } else {
        const error = await response.json()
        showErrorToast(error.error || 'Failed to send message')
      }
    } catch (error) {
      showErrorToast('Error sending message')
    } finally {
      setSendingMessage(false)
    }
  }

  const navigateToNotes = () => {
    router.push(`/spaces/${groupId}/notes`)
  }

  const handleBackToSpaces = () => {
    router.push('/dashboard')  // Change to dashboard instead of /spaces
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Group Not Found</h2>
          <Button onClick={handleBackToSpaces}>
            Back to Spaces
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ChatLayout>
      <ChatHeader>
        <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBackToSpaces} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Hash className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{group.name}</h1>
                <p className="text-sm text-gray-600">{group.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowMemberModal(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </Button>
            
            <Button
              variant="primary"
              onClick={navigateToNotes}
            >
              <FileText className="w-4 h-4 mr-2" />
              Switch to Notes
            </Button>
            
            <Button variant="ghost" size="sm">
              <Users className="w-4 h-4" />
              {members?.length || 0}
              <span className="hidden sm:inline ml-2">Members</span>
            </Button>
            
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </ChatHeader>

      <ChatMessagesArea>
        {messagesLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <EmptyState
              icon={MessageSquare}
              title="No messages yet"
              description="Be the first to start the conversation!"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwn = message.userId === user?.id
              const showAvatar = index === 0 || messages[index - 1]?.userId !== message.userId
              
              return (
                <MessageBubble
                  key={message.id}
                  message={{
                    ...message,
                    timestamp: formatMessageTime(message.createdAt)
                  }}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                />
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ChatMessagesArea>

      <ChatInput
        value={newMessage}
        onChange={setNewMessage}
        onSubmit={handleSendMessage}
        placeholder={`Message #${group.name.toLowerCase()}...`}
        disabled={sendingMessage}
        loading={sendingMessage}
      />

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Tambah Anggota ke Space</h2>
              <button 
                onClick={() => setShowMemberModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {(friends || []).filter(friend => !(members || []).some(member => member.id === friend.id)).length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Semua teman sudah menjadi anggota di space ini
              </p>
            ) : (
              <div className="space-y-2">
                {(friends || [])
                  .filter(friend => !(members || []).some(member => member.id === friend.id))
                  .map((friend) => (
                    <div key={friend.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{friend.name}</div>
                        <div className="text-sm text-gray-500">{friend.email}</div>
                      </div>
                      <Button
                        onClick={() => addMemberToGroup(friend.id)}
                        disabled={isAddingMember}
                        className="bg-green-500 text-white px-3 py-1 text-sm"
                      >
                        {isAddingMember ? 'Menambahkan...' : 'Tambah'}
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </ChatLayout>
  )
}
