# Group Chat Binder

A modern real-time group chat application built with Next.js 15, TypeScript, Prisma, and Supabase. Features comprehensive messaging, collaborative note-taking, friend system, and interactive API documentation.

## 🌐 Live Demo

**Production**: [https://group-chat-binder-hasd.vercel.app](https://group-chat-binder-hasd.vercel.app)
**API Documentation**: [https://group-chat-binder-hasd.vercel.app/api-docs](https://group-chat-binder-hasd.vercel.app/api-docs)

> **Note**: The API documentation on Vercel is view-only. For interactive testing, run the application locally where full Swagger UI functionality is available.

## ✨ Features

### Core Functionality

- **🏠 Spaces (Groups)**: Create and manage collaborative workspaces
- **💬 Real-time Messaging**: Instant chat with typing indicators
- **📝 Collaborative Notes**: Block-based note editor with rich content
- **👥 Friend System**: Send/accept friend requests and manage connections
- **📱 Direct Messages**: Private messaging between friends
- **🔔 Real-time Notifications**: Live updates for all activities
- **👤 Profile Management**: Customizable user profiles with avatars

### Technical Features

- **🔒 Secure Authentication**: Supabase Auth with email verification
- **📊 Interactive API Docs**: Complete Swagger UI documentation
- **⚡ Real-time Updates**: Live data synchronization
- **🎨 Modern UI**: Responsive design with Tailwind CSS
- **🔍 Smart Search**: Filter and find content easily
- **📱 Mobile Responsive**: Works perfectly on all devices

## 🛠 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage (for file uploads)
- **API Documentation**: OpenAPI 3.0 with Swagger UI
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or later
- **PostgreSQL** database or **Supabase** account (recommended)
- **Git** for cloning the repository

### Local Development Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Alvarras/group-chat-binder.git
   cd group-chat-binder
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env.local` file in the root directory:

   ```bash
   # Supabase Configuration (Required)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Database (Required)
   DATABASE_URL=postgresql://postgres:password@localhost:5432/group_chat_binder

   # NextAuth (Required for production)
   NEXTAUTH_SECRET=your-nextauth-secret-min-32-characters
   NEXTAUTH_URL=http://localhost:3000

   # Environment
   NODE_ENV=development
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Optional: Seed with sample data
   npm run db:seed
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

   **🎉 Access the application:**

   - **App**: http://localhost:3000
   - **API Docs**: http://localhost:3000/api-docs (Interactive Swagger UI)
   - **Database Studio**: http://localhost:5555 (run `npm run db:studio`)

## Database Design

### Database Schema

The application uses a comprehensive database schema designed for scalable group communication and collaboration:

![Database Schema](schema-database.svg)

#### Core Entities

**Users & Authentication**

- `User`: Core user profile with authentication data
- Integrated with Supabase Auth for secure authentication

**Spaces & Groups**

- `Space`: Collaborative workspaces/groups
- `SpaceMember`: User membership in spaces with roles
- Supports public/private spaces with member management

**Messaging System**

- `Message`: Real-time messages in spaces
- `DirectMessage`: Private messages between friends
- Supports rich text content and attachments

**Social Features**

- `Friend`: Friend connections between users
- `FriendRequest`: Friend request management system
- Enables private messaging and social interactions

**Collaborative Notes**

- `Note`: Block-based collaborative notes within spaces
- Rich content support with real-time editing
- Organized within spaces for team collaboration

**Notifications**

- `Notification`: Real-time notification system
- Tracks all user activities and updates
- Supports read/unread states

#### Key Relationships

- Users can belong to multiple spaces with different roles
- Each space can have multiple members, messages, and notes
- Friends can send direct messages to each other
- All activities generate notifications for relevant users
- Real-time synchronization across all entities

## 🗂 API Documentation

### Interactive Documentation (Local Only)

When running locally, access the full interactive Swagger UI at:

```
http://localhost:3000/api-docs
```

**Features available locally:**

- ✅ Try out API endpoints directly
- ✅ Authentication testing
- ✅ Request/response examples
- ✅ Schema validation
- ✅ Real-time API testing

### Production Documentation (Read-Only)

View the API specification at:

```
https://group-chat-binder-hasd.vercel.app/api-docs
```

> **⚠️ Note**: The production API docs are read-only due to CORS and authentication limitations on Vercel. For full testing capabilities, use the local development environment.

### Complete API Endpoints

#### 🔐 Authentication

- `POST /api/auth/signup` - User registration with email verification
- `POST /api/auth/create-profile` - Create user profile after verification
- `POST /api/auth/token` - Get authentication token
- `POST /api/auth/webhook` - Handle Supabase auth webhooks
- `POST /api/auth/confirm` - Confirm email verification

#### 👤 User Profile

- `GET /api/profile` - Get current user profile
- `PATCH /api/profile` - Update user profile
- `GET /api/users/{userId}` - Get user by ID

#### 🏠 Spaces (Groups)

- `GET /api/groups` - List user's groups
- `POST /api/groups` - Create new group/space
- `GET /api/groups/{id}` - Get group details
- `POST /api/groups/{id}/messages` - Send message to group
- `GET /api/groups/{id}/messages` - Get group messages

#### 📝 Notes

- `GET /api/notes/{id}` - Get note details
- `PATCH /api/notes/{id}` - Update note content
- `POST /api/groups/{id}/notes` - Create note in group

#### 👥 Friends & Social

- `GET /api/friends` - Get friends list
- `POST /api/friend-requests` - Send friend request
- `GET /api/friend-requests` - Get friend requests (sent/received)
- `PATCH /api/friend-requests/{id}` - Accept/decline friend request
- `DELETE /api/friend-requests/{id}` - Cancel friend request

#### 💬 Direct Messages

- `GET /api/direct-messages` - Get DM conversations
- `POST /api/direct-messages` - Send direct message
- `GET /api/direct-messages/{userId}` - Get messages with specific user

#### 🔔 Notifications

- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications` - Mark notifications as read

### API Authentication

All API endpoints (except auth endpoints) require authentication:

```bash
# Include in headers
Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN
Content-Type: application/json
```

**Getting Access Token:**

1. Sign up via `/api/auth/signup`
2. Verify email
3. Use `/api/auth/token` to get access token
4. Include token in subsequent requests

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Prepare Repository**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Deploy automatically

3. **Environment Variables for Production**

   Add these in Vercel Dashboard → Project Settings → Environment Variables:

   ```bash
   # Supabase (Required)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Database (Required)
   DATABASE_URL=postgresql://postgres:password@your-db-host:5432/database

   # NextAuth (Required)
   NEXTAUTH_SECRET=your-production-secret-32-chars-minimum
   NEXTAUTH_URL=https://your-app.vercel.app

   # Environment
   NODE_ENV=production
   ```

4. **Database Migration**

   After first deployment, run:

   ```bash
   npx prisma migrate deploy
   ```

### Deploy to Other Platforms

#### Railway

1. Connect GitHub repository to Railway
2. Add environment variables
3. Deploy automatically

#### DigitalOcean App Platform

1. Create new app from GitHub
2. Configure build settings: `npm run build`
3. Add environment variables

#### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🛠 Development & Contribution

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── groups/        # Group/space management
│   │   ├── friends/       # Friend system
│   │   ├── notes/         # Note management
│   │   └── notifications/ # Notification system
│   ├── api-docs/          # Swagger UI page
│   ├── dashboard/         # Main dashboard
│   ├── spaces/            # Space pages
│   ├── auth/              # Auth pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components (Radix UI)
│   ├── atoms/            # Small reusable components
│   ├── molecules/        # Composite components
│   └── organisms/        # Complex page sections
├── lib/                  # Utility libraries
│   ├── prisma.ts         # Database client
│   ├── supabase/         # Supabase configuration
│   ├── utils.ts          # Helper functions
│   └── toast.ts          # Notification helpers
├── hooks/                # Custom React hooks
├── types/                # TypeScript definitions
└── middleware.ts         # Next.js middleware

prisma/
├── schema.prisma         # Database schema
├── seed.js              # Seed data
└── migrations/          # Database migrations

public/
└── swagger.json         # OpenAPI specification
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Create and run migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database with sample data

# Utilities
npm run type-check       # TypeScript type checking
```

### Adding New Features

1. **API Endpoints**

   - Create route in `src/app/api/`
   - Add to `swagger.json` specification
   - Update TypeScript types in `src/types/`

2. **Database Changes**

   - Modify `prisma/schema.prisma`
   - Run `npm run db:generate`
   - Create migration with `npm run db:migrate`

3. **UI Components**
   - Follow atomic design principles
   - Use Tailwind CSS for styling
   - Ensure mobile responsiveness

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js configuration
- **Formatting**: Prettier integration
- **Components**: Functional components with hooks
- **State**: React Query for server state, useState for local state

## 🔧 Troubleshooting

### Common Issues

#### Database Connection

```bash
# Error: Connection refused
# Solution: Check DATABASE_URL and ensure database is running
npm run db:studio  # Test database connection
```

#### Supabase Authentication

```bash
# Error: Invalid API key
# Solution: Verify Supabase credentials in .env.local
# 1. Check project URL and keys in Supabase dashboard
# 2. Ensure RLS (Row Level Security) is properly configured
# 3. Verify service role key has admin privileges
```

#### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Regenerate Prisma client
npm run db:generate

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### API Documentation Issues

- **Local**: Full interactive Swagger UI at http://localhost:3000/api-docs
- **Production**: Read-only docs due to CORS limitations
- **Testing**: Use local environment for API testing

### Environment Setup Checklist

- ✅ Node.js 18+ installed
- ✅ PostgreSQL running or Supabase project created
- ✅ All environment variables in `.env.local`
- ✅ Prisma client generated (`npm run db:generate`)
- ✅ Database schema applied (`npm run db:push`)
- ✅ Development server running (`npm run dev`)

### Getting Help

1. **Check the logs**: Browser console and terminal output
2. **Verify environment**: All required variables are set
3. **Database status**: Ensure database is accessible
4. **API docs**: Use local Swagger UI for API testing
5. **GitHub Issues**: Report bugs and request features
