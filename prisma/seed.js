const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@demo.com' },
    update: {},
    create: {
      email: 'alice@demo.com',
      username: 'Alice',
      password: hashedPassword,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b9b3ac8e?w=150&h=150&fit=crop&crop=face',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@demo.com' },
    update: {},
    create: {
      email: 'bob@demo.com',
      username: 'Bob',
      password: hashedPassword,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'charlie@demo.com' },
    update: {},
    create: {
      email: 'charlie@demo.com',
      username: 'Charlie',
      password: hashedPassword,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
  })

  console.log('👥 Created demo users')

  // Create demo group
  const group = await prisma.group.create({
    data: {
      name: 'Demo Group',
      description: 'A demo group for testing the chat functionality',
      createdBy: user1.id,
    },
  })

  console.log('🏘️ Created demo group')

  // Add members to the group
  await prisma.groupMember.createMany({
    data: [
      {
        groupId: group.id,
        userId: user1.id,
        role: 'ADMIN',
      },
      {
        groupId: group.id,
        userId: user2.id,
        role: 'MEMBER',
      },
      {
        groupId: group.id,
        userId: user3.id,
        role: 'MEMBER',
      },
    ],
  })

  console.log('👤 Added members to group')

  // Create demo messages
  await prisma.message.createMany({
    data: [
      {
        content: 'Welcome to the demo group! 👋',
        groupId: group.id,
        userId: user1.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      },
      {
        content: 'Thanks Alice! Excited to try out the chat features.',
        groupId: group.id,
        userId: user2.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      },
      {
        content: 'The real-time messaging works great! 🚀',
        groupId: group.id,
        userId: user3.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      },
    ],
  })

  console.log('💬 Created demo messages')

  // Create demo note
  const note = await prisma.note.create({
    data: {
      title: 'Project Planning Notes',
      groupId: group.id,
      createdBy: user1.id,
    },
  })

  // Create demo note blocks
  await prisma.noteBlock.createMany({
    data: [
      {
        noteId: note.id,
        blockType: 'HEADING',
        content: { text: 'Project Overview', level: 1 },
        position: 0,
      },
      {
        noteId: note.id,
        blockType: 'PARAGRAPH',
        content: { text: 'This is our main project planning document. We can collaborate on this in real-time!' },
        position: 1,
      },
      {
        noteId: note.id,
        blockType: 'HEADING',
        content: { text: 'Features to Implement', level: 2 },
        position: 2,
      },
      {
        noteId: note.id,
        blockType: 'LIST',
        content: { 
          type: 'unordered',
          items: [
            'Real-time messaging ✅',
            'User authentication ✅',
            'Group management ✅',
            'Block-based notes ✅',
            'File sharing 🔄',
            'Push notifications 📋'
          ]
        },
        position: 3,
      },
      {
        noteId: note.id,
        blockType: 'QUOTE',
        content: { text: 'Great things are done by a series of small things brought together.', author: 'Vincent Van Gogh' },
        position: 4,
      },
    ],
  })

  console.log('📝 Created demo notes and blocks')

  console.log('✅ Database seeded successfully!')
  console.log('\n📋 Demo Credentials:')
  console.log('Email: alice@demo.com, bob@demo.com, or charlie@demo.com')
  console.log('Password: demo123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })