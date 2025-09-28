import React from 'react'
import { Button } from '@/components/ui/button'

interface SectionHeaderProps {
  title: string
  searchResults?: {
    count: number
    query: string
  }
  actionButton?: {
    label: string
    icon: React.ComponentType<{ className?: string }>
    onClick: () => void
  }
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  searchResults,
  actionButton
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {searchResults && (
          <p className="text-sm text-gray-500 mt-1">
            {searchResults.count} result{searchResults.count !== 1 ? 's' : ''} for "{searchResults.query}"
          </p>
        )}
      </div>
      {actionButton && (
        <Button 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={actionButton.onClick}
        >
          <actionButton.icon className="w-4 h-4 mr-2" />
          {actionButton.label}
        </Button>
      )}
    </div>
  )
}