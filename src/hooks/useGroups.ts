import { useState, useCallback, useEffect } from 'react'
import { Group } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { showSuccessToast, showErrorToast } from '@/lib/toast'

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const supabase = createClient()

  // Subscribe to real-time group changes
  useEffect(() => {
    const channel = supabase
      .channel('groups-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'groups',
        },
        (payload) => {
          const newGroup = payload.new as Group
          setGroups(prev => {
            if (!prev.find(g => g.id === newGroup.id)) {
              return [newGroup, ...prev]
            }
            return prev
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'groups',
        },
        (payload) => {
          const updatedGroup = payload.new as Group
          setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'groups',
        },
        (payload) => {
          const deletedGroup = payload.old as Group
          setGroups(prev => prev.filter(g => g.id !== deletedGroup.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    if (loading) return

    setLoading(true)
    try {
      const response = await fetch('/api/groups')
      
      if (response.ok) {
        const groupsData: Group[] = await response.json()
        setGroups(groupsData)
      } else {
        showErrorToast('Failed to load groups')
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
      showErrorToast('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }, [loading])

  // Create new group
  const createGroup = useCallback(async (data: {
    name: string
    description?: string
  }) => {
    if (creating) return null

    setCreating(true)
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const newGroup: Group = await response.json()
        // Group will be added via real-time subscription
        showSuccessToast('Group created successfully!')
        return newGroup
      } else {
        const errorData = await response.json()
        showErrorToast(errorData.error || 'Failed to create group')
        return null
      }
    } catch (error) {
      console.error('Error creating group:', error)
      showErrorToast('Failed to create group')
      return null
    } finally {
      setCreating(false)
    }
  }, [creating])

  // Join group (if invitation system is implemented)
  const joinGroup = useCallback(async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
      })

      if (response.ok) {
        const group: Group = await response.json()
        setGroups(prev => {
          if (!prev.find(g => g.id === group.id)) {
            return [...prev, group]
          }
          return prev
        })
        showSuccessToast('Joined group successfully!')
        return group
      } else {
        const errorData = await response.json()
        showErrorToast(errorData.error || 'Failed to join group')
        return null
      }
    } catch (error) {
      console.error('Error joining group:', error)
      showErrorToast('Failed to join group')
      return null
    }
  }, [])

  // Leave group
  const leaveGroup = useCallback(async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/leave`, {
        method: 'POST',
      })

      if (response.ok) {
        setGroups(prev => prev.filter(group => group.id !== groupId))
        showSuccessToast('Left group successfully!')
        return true
      } else {
        const errorData = await response.json()
        showErrorToast(errorData.error || 'Failed to leave group')
        return false
      }
    } catch (error) {
      console.error('Error leaving group:', error)
      showErrorToast('Failed to leave group')
      return false
    }
  }, [])

  // Get group by ID
  const getGroup = useCallback((groupId: string) => {
    return groups.find(group => group.id === groupId)
  }, [groups])

  // Refresh groups
  const refresh = useCallback(() => {
    fetchGroups()
  }, [fetchGroups])

  // Initial load
  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  return {
    groups,
    loading,
    creating,
    createGroup,
    joinGroup,
    leaveGroup,
    getGroup,
    refresh,
  }
}