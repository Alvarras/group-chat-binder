import React, { useState } from 'react'
import { NoteBlock, BlockType } from '@/types'
import { Button } from '@/components/atoms/Button/Button'
import { Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface NoteBlockEditorProps {
  block: NoteBlock
  isEditing: boolean
  onEdit: () => void
  onUpdate: (content: any) => void
  onDelete: () => void
  onStopEditing: () => void
}

const NoteBlockEditor: React.FC<NoteBlockEditorProps> = ({
  block,
  isEditing,
  onEdit,
  onUpdate,
  onDelete,
  onStopEditing
}) => {
  const [content, setContent] = useState(block.content)

  const handleSave = () => {
    onUpdate(content)
    onStopEditing()
  }

  const renderEditMode = () => {
    switch (block.blockType) {
      case 'PARAGRAPH':
        return (
          <div className="space-y-2">
            <textarea
              value={content.text || ''}
              onChange={(e) => setContent({ ...content, text: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Write something..."
              autoFocus
            />
            <div className="flex space-x-2">
              <
                Button size="sm" 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
              Save
              </Button>
              <Button size="sm" variant="secondary" onClick={onStopEditing}>Cancel</Button>
            </div>
          </div>
        )

      case 'HEADING':
        return (
          <div className="space-y-2">
            <select
              value={content.level || 1}
              onChange={(e) => setContent({ ...content, level: parseInt(e.target.value) })}
              className="px-3 py-1 border border-gray-300 rounded"
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
            </select>
            <input
              value={content.text || ''}
              onChange={(e) => setContent({ ...content, text: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl font-bold"
              placeholder="Heading text..."
              autoFocus
            />
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save
              </Button>
              <Button size="sm" variant="secondary" onClick={onStopEditing}>Cancel</Button>
            </div>
          </div>
        )

      case 'LIST':
        return (
          <div className="space-y-2">
            <select
              value={content.type || 'unordered'}
              onChange={(e) => setContent({ ...content, type: e.target.value })}
              className="px-3 py-1 border border-gray-300 rounded"
            >
              <option value="unordered">Bullet List</option>
              <option value="ordered">Numbered List</option>
            </select>
            <div className="space-y-1">
              {(content.items || ['']).map((item: string, index: number) => (
                <input
                  key={index}
                  value={item}
                  onChange={(e) => {
                    const newItems = [...(content.items || [''])]
                    newItems[index] = e.target.value
                    setContent({ ...content, items: newItems })
                  }}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Item ${index + 1}...`}
                />
              ))}
              <button
                onClick={() => {
                  const newItems = [...(content.items || ['']), '']
                  setContent({ ...content, items: newItems })
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add item
              </button>
            </div>
            <div className="flex space-x-2">
              <
                Button size="sm" 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save
              </Button>
              <Button size="sm" variant="secondary" onClick={onStopEditing}>Cancel</Button>
            </div>
          </div>
        )

      case 'CODE':
        return (
          <div className="space-y-2">
            <input
              value={content.language || ''}
              onChange={(e) => setContent({ ...content, language: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Language (optional)"
            />
            <textarea
              value={content.code || ''}
              onChange={(e) => setContent({ ...content, code: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              rows={5}
              placeholder="Enter your code..."
              autoFocus
            />
            <div className="flex space-x-2">
              <
                Button size="sm" 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
              Save
              </Button>
              <Button size="sm" variant="secondary" onClick={onStopEditing}>Cancel</Button>
            </div>
          </div>
        )

      case 'QUOTE':
        return (
          <div className="space-y-2">
            <textarea
              value={content.text || ''}
              onChange={(e) => setContent({ ...content, text: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Quote text..."
              autoFocus
            />
            <input
              value={content.author || ''}
              onChange={(e) => setContent({ ...content, author: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Author (optional)"
            />
            <div className="flex space-x-2">
              <
                Button size="sm" 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
              Save
              </Button>
              <Button size="sm" variant="secondary" onClick={onStopEditing}>Cancel</Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderViewMode = () => {
    switch (block.blockType) {
      case 'PARAGRAPH':
        return (
          <div
            onClick={onEdit}
            className="p-3 text-gray-700 cursor-text hover:bg-gray-50 rounded-lg min-h-[3rem]"
          >
            {content.text || (
              <span className="text-gray-400">Click to edit paragraph...</span>
            )}
          </div>
        )

      case 'HEADING':
        const HeadingTag = `h${content.level || 1}` as keyof React.JSX.IntrinsicElements
        return (
          <HeadingTag
            onClick={onEdit}
            className="font-bold cursor-text hover:bg-gray-50 rounded-lg p-2 -m-2"
            style={{
              fontSize: content.level === 1 ? '2rem' : content.level === 2 ? '1.5rem' : '1.25rem'
            }}
          >
            {content.text || (
              <span className="text-gray-400 text-base font-normal">Click to edit heading...</span>
            )}
          </HeadingTag>
        )

      case 'LIST':
        return (
          <div
            onClick={onEdit}
            className="cursor-text hover:bg-gray-50 rounded-lg p-2 -m-2"
          >
            {content.type === 'ordered' ? (
              <ol className="list-decimal list-inside space-y-1">
                {(content.items || ['']).map((item: string, index: number) => (
                  <li key={index} className="text-gray-700">
                    {item || <span className="text-gray-400">Empty item</span>}
                  </li>
                ))}
              </ol>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {(content.items || ['']).map((item: string, index: number) => (
                  <li key={index} className="text-gray-700">
                    {item || <span className="text-gray-400">Empty item</span>}
                  </li>
                ))}
              </ul>
            )}
            {(!content.items || content.items.length === 0) && (
              <span className="text-gray-400">Click to edit list...</span>
            )}
          </div>
        )

      case 'CODE':
        return (
          <div
            onClick={onEdit}
            className="cursor-text hover:bg-gray-50 rounded-lg p-2 -m-2"
          >
            <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
              {content.language && (
                <div className="text-xs text-gray-500 mb-2">{content.language}</div>
              )}
              <pre className="whitespace-pre-wrap">
                {content.code || (
                  <span className="text-gray-400 font-sans">Click to edit code...</span>
                )}
              </pre>
            </div>
          </div>
        )

      case 'QUOTE':
        return (
          <div
            onClick={onEdit}
            className="cursor-text hover:bg-gray-50 rounded-lg p-2 -m-2"
          >
            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700">
              {content.text || (
                <span className="text-gray-400 not-italic">Click to edit quote...</span>
              )}
              {content.author && (
                <footer className="text-sm text-gray-500 mt-2">— {content.author}</footer>
              )}
            </blockquote>
          </div>
        )

      case 'DIVIDER':
        return <hr className="border-gray-300 my-6" />

      default:
        return null
    }
  }

  return (
    <div className="group relative">
      <div className="flex items-start space-x-2">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-gray-400 mt-2" />
        </div>
        <div className="flex-1">
          {isEditing ? renderEditMode() : renderViewMode()}
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
          title="Delete block"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export { NoteBlockEditor }