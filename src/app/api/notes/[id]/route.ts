import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { prisma } from '@/lib/prisma'
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const note = await prisma.note.findUnique({
      where: {
        id: id
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        },
        blocks: {
          orderBy: {
            position: 'asc'
          }
        },
        group: {
          include: {
            members: {
              where: {
                userId: user.id
              }
            }
          }
        }
      }
    })
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    if (note.group.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json(note)
  } catch (error) {
    console.error('Error fetching note:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}