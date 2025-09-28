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
      where: { id },
      include: {
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
    if (!note || note.group.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const blocks = await prisma.noteBlock.findMany({
      where: { noteId: id },
      orderBy: { position: 'asc' }
    })
    return NextResponse.json(blocks)
  } catch (error) {
    console.error('Error fetching blocks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { blockType, content, position } = await request.json()
    if (!blockType) {
      return NextResponse.json(
        { error: 'Block type is required' },
        { status: 400 }
      )
    }
    const note = await prisma.note.findUnique({
      where: {
        id: id
      },
      include: {
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
    if (!note || note.group.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    let blockPosition = position
    if (blockPosition === undefined) {
      const lastBlock = await prisma.noteBlock.findFirst({
        where: {
          noteId: id
        },
        orderBy: {
          position: 'desc'
        }
      })
      blockPosition = (lastBlock?.position || -1) + 1
    }
    const block = await prisma.noteBlock.create({
      data: {
        noteId: id,
        blockType,
        content: content || {},
        position: blockPosition
      }
    })
    return NextResponse.json(block)
  } catch (error) {
    console.error('Error creating block:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}