'use client'

import React, { FormEvent } from 'react'
import { Input } from '@/components/atoms/Input/Input'
import { Button } from '@/components/atoms/Button/Button'
import { Send } from 'lucide-react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  className?: string
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type a message...',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e as any)
    }
  }

  return (
    <div className={`bg-white border-t border-gray-200 px-6 py-4 sticky bottom-0 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <form onSubmit={onSubmit} className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="rounded-full"
              disabled={disabled}
            />
          </div>
          
          <Button
            type="submit"
            loading={loading}
            disabled={!value.trim() || disabled}
            className="rounded-full p-3"
            variant="primary"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}