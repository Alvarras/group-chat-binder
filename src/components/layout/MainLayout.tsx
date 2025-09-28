'use client'

import React, { useState } from 'react'
import { useSupabase } from '@/lib/supabase/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/atoms/Button/Button'
import { Avatar } from '@/components/atoms/Avatar/Avatar'
import { Modal } from '@/components/atoms/Modal/Modal'
import { 
  MessageSquare, 
  FileText, 
  LogOut,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
  User,
  Hash,
  Home,
  Settings,
  Bell
} from 'lucide-react'

interface MainLayoutProps {
  children: React.ReactNode
  activeView?: string
  showSidebar?: boolean
}

export function MainLayout({ children, activeView, showSidebar = false }: MainLayoutProps) {
  const { user, signOut } = useSupabase()
  const router = useRouter()
  const [showProfileModal, setShowProfileModal] = useState(false)

  const navigationItems = [
    {
      key: 'spaces',
      label: 'Spaces',
      icon: Hash,
      path: '/spaces'
    },
    {
      key: 'direct-messages',
      label: 'Direct Messages',
      icon: MessageSquare,
      path: '/direct-messages'
    },
    {
      key: 'activity',
      label: 'Activity',
      icon: Bell,
      path: '/activity'
    },
    {
      key: 'friends',
      label: 'Friends',
      icon: Users,
      path: '/friends'
    }
  ]

  const handleNavigation = (item: any) => {
    router.push(item.path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Only show sidebar if specified */}
      {showSidebar && (
        <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg flex flex-col z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">ChatGroups</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeView === item.key ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* User Profile at bottom */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Avatar
                size="sm"
                fallback={user?.user_metadata?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                src={user?.user_metadata?.avatar_url}
              />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-700">{user?.user_metadata?.username || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={showSidebar ? 'ml-64' : ''}>
        {children}
      </div>

      {/* Profile Modal */}
      <Modal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        title="User Profile"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar
              size="lg"
              fallback={user?.user_metadata?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              src={user?.user_metadata?.avatar_url}
            />
            <div>
              <h3 className="text-lg font-medium">{user?.user_metadata?.username || 'User'}</h3>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <Button
              variant="secondary"
              onClick={() => signOut()}
              className="w-full justify-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}