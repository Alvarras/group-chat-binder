import { useState, useCallback, useEffect } from 'react'
import { Note, NoteBlock, BlockType } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { showSuccessToast, showErrorToast } from '@/lib/toast'

interface UseNotesProps {
  groupId?: string
}

interface UseNoteBlocksProps {
  noteId: string
}

export function useNotes({ groupId }: UseNotesProps = {}) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const supabase = createClient()

  // Subscribe to real-time note changes
  useEffect(() => {
    if (!groupId) return

    const channel = supabase
      .channel(`notes:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notes',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const newNote = payload.new as Note
          setNotes(prev => {
            if (!prev.find(n => n.id === newNote.id)) {
              return [newNote, ...prev]
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
          table: 'notes',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const updatedNote = payload.new as Note
          setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notes',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const deletedNote = payload.old as Note
          setNotes(prev => prev.filter(n => n.id !== deletedNote.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, supabase])

  // Fetch notes for a group
  const fetchNotes = useCallback(async () => {
    if (!groupId || loading) return

    setLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/notes`)
      
      if (response.ok) {
        const notesData: Note[] = await response.json()
        setNotes(notesData)
      } else {
        showErrorToast('Failed to load notes')
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      showErrorToast('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }, [groupId, loading])

  // Create new note
  const createNote = useCallback(async (title: string) => {
    if (!groupId || creating) return null

    setCreating(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      })

      if (response.ok) {
        const newNote: Note = await response.json()
        // Note will be added via real-time subscription
        showSuccessToast('Note created successfully!')
        return newNote
      } else {
        const errorData = await response.json()
        showErrorToast(errorData.error || 'Failed to create note')
        return null
      }
    } catch (error) {
      console.error('Error creating note:', error)
      showErrorToast('Failed to create note')
      return null
    } finally {
      setCreating(false)
    }
  }, [groupId, creating])

  // Delete note
  const deleteNote = useCallback(async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Note will be removed via real-time subscription
        showSuccessToast('Note deleted successfully!')
        return true
      } else {
        const errorData = await response.json()
        showErrorToast(errorData.error || 'Failed to delete note')
        return false
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      showErrorToast('Failed to delete note')
      return false
    }
  }, [])

  // Get note by ID
  const getNote = useCallback((noteId: string) => {
    return notes.find(note => note.id === noteId)
  }, [notes])

  // Refresh notes
  const refresh = useCallback(() => {
    fetchNotes()
  }, [fetchNotes])

  // Initial load
  useEffect(() => {
    if (groupId) {
      fetchNotes()
    }
  }, [groupId, fetchNotes])

  return {
    notes,
    loading,
    creating,
    createNote,
    deleteNote,
    getNote,
    refresh,
  }
}

export function useNoteBlocks({ noteId }: UseNoteBlocksProps) {
  const [blocks, setBlocks] = useState<NoteBlock[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  // Subscribe to real-time note block changes
  useEffect(() => {
    if (!noteId) return

    const channel = supabase
      .channel(`note-blocks:${noteId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'note_blocks',
          filter: `note_id=eq.${noteId}`,
        },
        (payload) => {
          const newBlock = payload.new as NoteBlock
          setBlocks(prev => {
            if (!prev.find(b => b.id === newBlock.id)) {
              return [...prev, newBlock].sort((a, b) => a.position - b.position)
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
          table: 'note_blocks',
          filter: `note_id=eq.${noteId}`,
        },
        (payload) => {
          const updatedBlock = payload.new as NoteBlock
          setBlocks(prev => 
            prev.map(b => b.id === updatedBlock.id ? updatedBlock : b)
              .sort((a, b) => a.position - b.position)
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'note_blocks',
          filter: `note_id=eq.${noteId}`,
        },
        (payload) => {
          const deletedBlock = payload.old as NoteBlock
          setBlocks(prev => prev.filter(b => b.id !== deletedBlock.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [noteId, supabase])

  // Fetch note blocks
  const fetchBlocks = useCallback(async () => {
    if (!noteId || loading) return

    setLoading(true)
    try {
      const response = await fetch(`/api/notes/${noteId}`)
      
      if (response.ok) {
        const noteData = await response.json()
        setBlocks(noteData.blocks || [])
      } else {
        showErrorToast('Failed to load note blocks')
      }
    } catch (error) {
      console.error('Error fetching note blocks:', error)
      showErrorToast('Failed to load note blocks')
    } finally {
      setLoading(false)
    }
  }, [noteId, loading])

  // Add new block
  const addBlock = useCallback(async (blockType: BlockType, position?: number) => {
    if (!noteId) return null

    const newPosition = position !== undefined ? position : blocks.length

    try {
      const response = await fetch(`/api/notes/${noteId}/blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blockType,
          content: getDefaultContent(blockType),
          position: newPosition,
        }),
      })

      if (response.ok) {
        const newBlock: NoteBlock = await response.json()
        // Block will be added via real-time subscription
        return newBlock
      } else {
        const errorData = await response.json()
        showErrorToast(errorData.error || 'Failed to add block')
        return null
      }
    } catch (error) {
      console.error('Error adding block:', error)
      showErrorToast('Failed to add block')
      return null
    }
  }, [noteId, blocks.length])

  // Update block
  const updateBlock = useCallback(async (blockId: string, content: any) => {
    if (updating) return false

    setUpdating(true)
    try {
      const response = await fetch(`/api/notes/${noteId}/blocks/${blockId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        const updatedBlock: NoteBlock = await response.json()
        // Block will be updated via real-time subscription
        return true
      } else {
        const errorData = await response.json()
        showErrorToast(errorData.error || 'Failed to update block')
        return false
      }
    } catch (error) {
      console.error('Error updating block:', error)
      showErrorToast('Failed to update block')
      return false
    } finally {
      setUpdating(false)
    }
  }, [noteId, updating])

  // Delete block
  const deleteBlock = useCallback(async (blockId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/blocks/${blockId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Block will be removed via real-time subscription
        showSuccessToast('Block deleted successfully!')
        return true
      } else {
        const errorData = await response.json()
        showErrorToast(errorData.error || 'Failed to delete block')
        return false
      }
    } catch (error) {
      console.error('Error deleting block:', error)
      showErrorToast('Failed to delete block')
      return false
    }
  }, [noteId])

  // Move block (reorder)
  const moveBlock = useCallback(async (blockId: string, newPosition: number) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/blocks/${blockId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ position: newPosition }),
      })

      if (response.ok) {
        // Block will be updated via real-time subscription
        return true
      } else {
        const errorData = await response.json()
        showErrorToast(errorData.error || 'Failed to move block')
        return false
      }
    } catch (error) {
      console.error('Error moving block:', error)
      showErrorToast('Failed to move block')
      return false
    }
  }, [noteId])

  // Initial load
  useEffect(() => {
    if (noteId) {
      fetchBlocks()
    }
  }, [noteId, fetchBlocks])

  return {
    blocks,
    loading,
    updating,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    refresh: fetchBlocks,
  }
}

// Helper function to get default content for different block types
function getDefaultContent(blockType: BlockType) {
  switch (blockType) {
    case BlockType.PARAGRAPH:
      return { text: '' }
    case BlockType.HEADING:
      return { text: '', level: 1 }
    case BlockType.LIST:
      return { items: [''], type: 'unordered' }
    case BlockType.CODE:
      return { code: '', language: 'javascript' }
    case BlockType.QUOTE:
      return { text: '', author: '' }
    case BlockType.DIVIDER:
      return {}
    default:
      return {}
  }
}