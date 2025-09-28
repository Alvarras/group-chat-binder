'use client'

import React, { ReactNode } from 'react'

interface ChatLayoutProps {
  children: ReactNode
  className?: string
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div 
      className={`min-h-screen flex flex-col ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23f0f0f0' fill-opacity='0.1'%3e%3ccircle cx='30' cy='30' r='4'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        backgroundColor: '#f0f2f5'
      }}
    >
      {children}
    </div>
  )
}