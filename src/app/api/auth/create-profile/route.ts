import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function POST(request: NextRequest) {
  try {
    const { id, email, username } = await request.json()
    if (!id || !email || !username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id },
          { email },
          { username }
        ]
      }
    })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }
    const user = await prisma.user.create({
      data: {
        id,
        email,
        username,
        password: '',
      }
    })
    return NextResponse.json({
      message: 'User profile created successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    })
  } catch (error) {
    console.error('Profile creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}