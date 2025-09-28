'use client'

import React, { ReactNode } from 'react'

interface ChatHeaderProps {
  children: ReactNode
  className?: string
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm ${className}`}>
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </div>
  )
}