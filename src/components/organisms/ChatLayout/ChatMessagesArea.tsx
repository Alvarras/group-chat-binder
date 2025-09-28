'use client'

import React, { ReactNode } from 'react'

interface ChatMessagesAreaProps {
  children: ReactNode
  className?: string
}

export const ChatMessagesArea: React.FC<ChatMessagesAreaProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`flex-1 overflow-auto py-8 ${className}`}>
      <div className="max-w-4xl mx-auto px-6">
        {children}
      </div>
    </div>
  )
}