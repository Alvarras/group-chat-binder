import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser(request?: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      console.log('No authenticated user:', error?.message)
      return null
    }

    // Ensure user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser) {
      console.log('User not found in database, creating:', user.id)
      // Create user in database if they exist in Supabase but not in our DB
      try {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email!,
            username: user.user_metadata?.username || user.email!.split('@')[0],
            password: '',
            avatarUrl: user.user_metadata?.avatar_url || null,
          }
        })
      } catch (createError) {
        console.error('Failed to create user in database:', createError)
        // Continue with the Supabase user data
      }
    }
    
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}