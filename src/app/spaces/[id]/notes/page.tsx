'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/supabase/auth-provider'
import { Button } from '@/components/atoms/Button/Button'
import { Input } from '@/components/atoms/Input/Input'
import { Modal } from '@/components/atoms/Modal/Modal'
import { NoteBlockEditor } from '@/components/molecules/NoteBlockEditor/NoteBlockEditor'
import { Note, NoteBlock, Group } from '@/types'
import { 
  Plus,
  MessageSquare,
  FileText,
  Calendar,
  Edit3,
  Type,
  Heading,
  List,
  Code,
  Quote,
  Minus,
  ArrowLeft,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

export default function NotesPage() {
  const params = useParams()
  const groupId = params?.id as string
  const router = useRouter()
  const { user } = useSupabase()
  
  // State
  const [group, setGroup] = useState<Group | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [noteBlocks, setNoteBlocks] = useState<NoteBlock[]>([])
  const [editingBlock, setEditingBlock] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [notesLoading, setNotesLoading] = useState(false)
  const [blocksLoading, setBlocksLoading] = useState(false)
  const [showCreateNote, setShowCreateNote] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [createNoteLoading, setCreateNoteLoading] = useState(false)
  const [showAddBlockMenu, setShowAddBlockMenu] = useState(false)

  // Block types untuk menu
  const blockTypes = [
    { type: 'PARAGRAPH', label: 'Paragraph', icon: Type },
    { type: 'HEADING', label: 'Heading', icon: Heading },
    { type: 'LIST', label: 'List', icon: List },
    { type: 'CODE', label: 'Code', icon: Code },
    { type: 'QUOTE', label: 'Quote', icon: Quote },
    { type: 'DIVIDER', label: 'Divider', icon: Minus }
  ]

  // Fetch group data
  useEffect(() => {
    if (groupId && user?.id) {
      fetchGroupData()
      fetchNotes()
    }
  }, [groupId, user])

  // Fetch note blocks when a note is selected
  useEffect(() => {
    if (selectedNote) {
      fetchNoteBlocks(selectedNote)
    } else {
      setNoteBlocks([])
    }
  }, [selectedNote])

  const fetchGroupData = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`)
      if (response.ok) {
        const data = await response.json()
        setGroup(data)
      } else if (response.status === 403) {
        toast.error('Access denied')
        router.push('/dashboard')
      } else {
        toast.error('Failed to fetch group data')
      }
    } catch (error) {
      toast.error('Error fetching group data')
    } finally {
      setLoading(false)
    }
  }

  const navigateToChat = () => {
    router.push(`/spaces/${groupId}/chat`)
  }

  const handleBackToSpaces = () => {
    router.push('/dashboard')
  }

  const fetchNotes = async () => {
    try {
      setNotesLoading(true)
      const response = await fetch(`/api/groups/${groupId}/notes`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      } else if (response.status === 403) {
        toast.error('Access denied')
        router.push('/dashboard')
      } else {
        toast.error('Failed to fetch notes')
      }
    } catch (error) {
      toast.error('Error fetching notes')
    } finally {
      setNotesLoading(false)
    }
  }

  const fetchNoteBlocks = async (noteId: string) => {
    try {
      setBlocksLoading(true)
      const response = await fetch(`/api/notes/${noteId}`)
      if (response.ok) {
        const noteData = await response.json()
        const blocks = noteData.blocks || []
        setNoteBlocks(blocks.sort((a: NoteBlock, b: NoteBlock) => a.position - b.position))
      } else if (response.status === 404) {
        toast.error('Note not found')
        setNoteBlocks([])
      } else if (response.status === 403) {
        toast.error('Access denied to this note')
        setNoteBlocks([])
      } else {
        toast.error('Failed to fetch note blocks')
        setNoteBlocks([])
      }
    } catch (error) {
      console.error('Error fetching note blocks:', error)
      toast.error('Error fetching note blocks')
      setNoteBlocks([])
    } finally {
      setBlocksLoading(false)
    }
  }

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteTitle.trim()) return

    setCreateNoteLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newNoteTitle.trim()
        })
      })

      if (response.ok) {
        const newNote = await response.json()
        setNotes(prev => [newNote, ...prev])
        setNewNoteTitle('')
        setShowCreateNote(false)
        setSelectedNote(newNote.id)
        toast.success('Note created successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create note')
      }
    } catch (error) {
      toast.error('Error creating note')
    } finally {
      setCreateNoteLoading(false)
    }
  }

  const handleAddBlock = async (blockType: string) => {
    if (!selectedNote) return

    try {
      const response = await fetch(`/api/notes/${selectedNote}/blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          blockType,
          content: getDefaultContent(blockType)
        })
      })

      if (response.ok) {
        const newBlock = await response.json()
        setNoteBlocks(prev => [...prev, newBlock].sort((a, b) => a.position - b.position))
        setEditingBlock(newBlock.id)
        setShowAddBlockMenu(false)
        toast.success('Block added successfully!')
      } else {
        toast.error('Failed to add block')
      }
    } catch (error) {
      toast.error('Error adding block')
    }
  }

  const getDefaultContent = (blockType: string) => {
    switch (blockType) {
      case 'PARAGRAPH':
        return { text: '' }
      case 'HEADING':
        return { text: '', level: 1 }
      case 'LIST':
        return { type: 'unordered', items: [''] }
      case 'CODE':
        return { code: '', language: '' }
      case 'QUOTE':
        return { text: '', author: '' }
      case 'DIVIDER':
        return {}
      default:
        return {}
    }
  }

  const handleBlockUpdate = async (blockId: string, content: any) => {
    try {
      const response = await fetch(`/api/notes/${selectedNote}/blocks/${blockId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      })

      if (response.ok) {
        const updatedBlock = await response.json()
        setNoteBlocks(prev => prev.map(block => 
          block.id === blockId ? updatedBlock : block
        ))
        toast.success('Block updated successfully!')
      } else {
        toast.error('Failed to update block')
      }
    } catch (error) {
      toast.error('Error updating block')
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    try {
      const response = await fetch(`/api/notes/${selectedNote}/blocks/${blockId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNoteBlocks(prev => prev.filter(block => block.id !== blockId))
        toast.success('Block deleted successfully!')
      } else {
        toast.error('Failed to delete block')
      }
    } catch (error) {
      toast.error('Error deleting block')
    }
  }

  // Removed duplicate navigateToChat and handleBackToSpaces functions

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

  const selectedNoteData = notes.find(note => note.id === selectedNote)

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBackToSpaces} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{group.name} - Notes</h1>
                <p className="text-sm text-gray-600">{group.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="primary"
              onClick={navigateToChat}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Back to Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Notes Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between h-12">
              <h2 className="font-semibold text-gray-800">All Notes</h2>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowCreateNote(true)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-auto">
            {notesLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-3 border border-gray-200 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="p-4 text-center">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-4">No notes yet</p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowCreateNote(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Note
                </Button>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNote(note.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedNote === note.id
                        ? 'bg-blue-100 border border-blue-200'
                        : 'hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <h3 className="font-medium text-gray-800 mb-1">{note.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>By {note.creator?.username}</span>
                      <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Note Editor */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedNote && selectedNoteData ? (
            <>
              {/* Note Header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between h-12">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{selectedNoteData.title}</h1>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDistanceToNow(new Date(selectedNoteData.updatedAt), { addSuffix: true })}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Edit3 className="w-4 h-4 mr-1" />
                        {selectedNoteData.creator?.username}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => setShowAddBlockMenu(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Block
                    </Button>
                  </div>
                </div>
              </div>

              {/* Note Content */}
              <div className="flex-1 overflow-auto">
                <div className="max-w-4xl mx-auto px-6 py-8">
                  {blocksLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-32 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : noteBlocks.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Empty Note</h3>
                      <p className="text-gray-500 mb-4">Start by adding some content blocks.</p>
                      <Button 
                        variant="primary"
                        onClick={() => setShowAddBlockMenu(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Block
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {noteBlocks.map((block) => (
                        <NoteBlockEditor
                          key={block.id}
                          block={block}
                          isEditing={editingBlock === block.id}
                          onEdit={() => setEditingBlock(block.id)}
                          onStopEditing={() => setEditingBlock(null)}
                          onUpdate={(content) => handleBlockUpdate(block.id, content)}
                          onDelete={() => handleDeleteBlock(block.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-medium text-gray-700 mb-2">Select a note</h2>
                <p className="text-gray-500 mb-6">Choose a note from the sidebar to view and edit its contents.</p>
                <Button 
                  variant="primary"
                  onClick={() => setShowCreateNote(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Note
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Note Modal */}
      <Modal 
        isOpen={showCreateNote} 
        onClose={() => setShowCreateNote(false)}
        title="Create New Note"
      >
        <form onSubmit={handleCreateNote} className="space-y-4">
          <div>
            <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Note Title
            </label>
            <Input
              id="noteTitle"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Enter note title..."
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setShowCreateNote(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createNoteLoading} variant="primary">
              Create Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Block Menu Modal */}
      <Modal 
        isOpen={showAddBlockMenu} 
        onClose={() => setShowAddBlockMenu(false)}
        title="Add Content Block"
      >
        <div className="space-y-2">
          {blockTypes.map((blockType) => {
            const Icon = blockType.icon
            return (
              <button
                key={blockType.type}
                onClick={() => handleAddBlock(blockType.type)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <Icon className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-800">{blockType.label}</div>
                  <div className="text-sm text-gray-500">
                    {blockType.type === 'PARAGRAPH' && 'Add a paragraph of text'}
                    {blockType.type === 'HEADING' && 'Add a section heading'}
                    {blockType.type === 'LIST' && 'Create a bulleted or numbered list'}
                    {blockType.type === 'CODE' && 'Add a code snippet'}
                    {blockType.type === 'QUOTE' && 'Add a quote or citation'}
                    {blockType.type === 'DIVIDER' && 'Add a visual divider'}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </Modal>
    </div>
  )
}