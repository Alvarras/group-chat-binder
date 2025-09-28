import { useState, useEffect, useCallback } from 'react'
import { Message } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { showErrorToast } from '@/lib/toast'

interface UseMessagesProps {
  groupId: string
  initialMessages?: Message[]
}

export function useMessages({ groupId, initialMessages = [] }: UseMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const supabase = createClient()

  // Subscribe to real-time messages for the group
  useEffect(() => {
    if (!groupId) return

    const channel = supabase
      .channel(`group-messages:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev
            }
            return [...prev, newMessage]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, supabase])

  // Fetch messages from API
  const fetchMessages = useCallback(async (pageNum = 1, append = false) => {
    if (loading) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/groups/${groupId}/messages?page=${pageNum}&limit=50`
      )

      if (response.ok) {
        const newMessages: Message[] = await response.json()
        
        setMessages(prev => {
          if (append) {
            return [...newMessages, ...prev]
          }
          return newMessages
        })

        setHasMore(newMessages.length === 50)
        if (append) {
          setPage(pageNum)
        }
      } else {
        showErrorToast('Failed to load messages')
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      showErrorToast('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [groupId, loading])

  // Load more messages (pagination)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchMessages(page + 1, true)
    }
  }, [fetchMessages, page, loading, hasMore])

  // Send new message
  const sendMessage = useCallback(async (content: string, messageType: 'TEXT' | 'FILE' = 'TEXT') => {
    if (!content.trim() || sending) return

    setSending(true)
    
    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          messageType,
        }),
      })

      if (response.ok) {
        // Message will be added via real-time subscription
        // const message: Message = await response.json()
        // setMessages(prev => [...prev, message])
      } else {
        showErrorToast('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      showErrorToast('Failed to send message')
    } finally {
      setSending(false)
    }
  }, [groupId, sending])

  // Refresh messages
  const refresh = useCallback(() => {
    setPage(1)
    setHasMore(true)
    fetchMessages(1, false)
  }, [fetchMessages])

  // Initial load
  useEffect(() => {
    if (groupId && messages.length === 0) {
      fetchMessages()
    }
  }, [groupId, fetchMessages, messages.length])

  return {
    messages,
    loading,
    sending,
    hasMore,
    sendMessage,
    loadMore,
    refresh,
  }
}