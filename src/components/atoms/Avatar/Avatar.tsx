import React from 'react'
import { cn } from '@/lib/utils'

export interface AvatarProps {
  src?: string
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  fallback?: string
  online?: boolean
  className?: string
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  fallback,
  online,
  className
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  }

  const onlineSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-3 h-3'
  }

  return (
    <div className={cn('relative inline-block', className)}>
      <div className={cn(
        'rounded-full bg-gray-300 flex items-center justify-center font-medium text-gray-700 overflow-hidden',
        sizes[size]
      )}>
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span>{fallback}</span>
        )}
      </div>
      {online && (
        <div className={cn(
          'absolute bottom-0 right-0 bg-green-400 border-2 border-white rounded-full',
          onlineSizes[size]
        )} />
      )}
    </div>
  )
}

export { Avatar }