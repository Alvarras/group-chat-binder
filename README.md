# Group Chat Binder

A modern group chat application built with Next.js, TypeScript, Prisma, and Supabase. Features real-time messaging, group management, note-taking, and comprehensive API documentation.

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **UI Components**: Radix UI primitives with custom styling
- **API Documentation**: OpenAPI 3.0 with Swagger UI
- **Testing**: Jest with comprehensive unit tests
- **Real-time**: Supabase Realtime subscriptions

## Features

- **Group Management**: Create and manage chat groups
- **Real-time Messaging**: Send and receive messages instantly
- **Note Taking**: Create and edit collaborative notes with block-based content
- **Friend System**: Send/accept friend requests and manage friendships
- **Direct Messages**: Private messaging between friends
- **Notifications**: Real-time notifications for various events
- **Profile Management**: Update user profiles and avatars
- **API Documentation**: Interactive Swagger UI for all endpoints

## Installation

### Prerequisites

- Node.js 18.0 or later
- PostgreSQL database (or Supabase account)
- Git

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Alvarras/gorup-chat-binder.git
   cd gorup-chat-binder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

4. **Configure Environment Variables**
   
   Edit `.env.local` with your configuration:
   ```bash
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/gorup_chat_binder"
   
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   
   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-min-32-characters"
   
   # Node Environment
   NODE_ENV="development"
   ```

5. **Database Setup**
   ```bash
   # Generate Prisma Client
   npm run db:generate
   
   # Apply database migrations
   npm run db:push
   
   # Seed database with sample data (optional)
   npm run db:seed
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1...` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth secret key | `your-32-character-secret` |

### Getting Supabase Credentials

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your project URL and keys
3. Go to Settings > Database to get your connection string

## Usage

### Running the Application

1. **Development Mode**
   ```bash
   npm run dev
   ```

2. **Production Build**
   ```bash
   npm run build
   npm start
   ```

3. **Database Management**
   ```bash
   # View database in browser
   npm run db:studio
   
   # Reset database (careful!)
   npm run db:reset
   
   # Create new migration
   npm run db:migrate
   ```

### API Documentation

Access the interactive Swagger API documentation at:
```
http://localhost:3000/api-docs
```

The API documentation includes:
- All 18+ API endpoints with detailed descriptions
- Request/response schemas and examples
- Authentication requirements
- Interactive testing interface
- Model definitions for all data structures

### Key API Endpoints

- **Authentication**: `POST /api/auth/create-profile`
- **Groups**: `GET|POST /api/groups`, `GET /api/groups/{id}`
- **Messages**: `GET|POST /api/groups/{id}/messages`
- **Notes**: `GET /api/notes/{id}`, `POST /api/groups/{id}/notes`
- **Friends**: `GET /api/friends`, `GET|POST /api/friend-requests`
- **Profile**: `GET|PATCH /api/profile`
- **Notifications**: `GET|POST /api/notifications`

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Test Structure

The test suite includes:
- **Unit Tests**: Comprehensive API endpoint testing
- **Integration Tests**: Database and authentication flows
- **Mocking**: Supabase Auth and Prisma client mocking
- **Coverage**: Detailed code coverage reporting

Tests are located in `__tests__/api/` and cover:
- Success and failure scenarios
- Authentication and authorization
- Input validation
- Error handling
- Database operations

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── api-docs/       # Swagger UI page
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Main dashboard
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── ui/            # Base UI components
│   │   ├── atoms/         # Atomic components
│   │   ├── molecules/     # Composite components
│   │   └── organisms/     # Complex components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   │   ├── prisma.ts      # Database client
│   │   └── supabase/      # Supabase configuration
│   └── types/             # TypeScript type definitions
├── prisma/                # Database schema and migrations
├── __tests__/             # Test files
├── swagger.json           # OpenAPI specification
├── jest.config.js         # Jest configuration
└── README.md             # This file
```

## Development

### Adding New API Endpoints

1. Create new route file in `src/app/api/`
2. Update OpenAPI specification in `swagger.json`
3. Add corresponding tests in `__tests__/api/`
4. Update database schema in `prisma/schema.prisma` if needed

### Database Changes

1. Modify `prisma/schema.prisma`
2. Generate Prisma client: `npm run db:generate`
3. Push changes: `npm run db:push`
4. Create migration for production: `npm run db:migrate`

### Code Quality

- All code follows TypeScript strict mode
- ESLint configured for Next.js and React
- Prettier for consistent formatting
- Comprehensive test coverage required
- No comments in production code (clean code principles)

## Deployment

### Vercel (Recommended)

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production

Ensure all environment variables are configured in your deployment platform:
- Database connection string
- Supabase credentials
- NextAuth configuration
- Any additional service keys

### Database Migration

For production deployments:
```bash
npm run db:migrate
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes and add tests
4. Run tests: `npm test`
5. Commit changes: `git commit -m "Add new feature"`
6. Push to branch: `git push origin feature/new-feature`
7. Create Pull Request

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` format
   - Check database server is running
   - Ensure database exists

2. **Supabase Authentication Issues**
   - Verify Supabase project is active
   - Check API keys are correct
   - Ensure RLS policies are configured

3. **Build Failures**
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Generate Prisma client: `npm run db:generate`

4. **Test Failures**
   - Ensure test database is set up
   - Check mock configurations
   - Verify environment variables

### Getting Help

- Check the API documentation at `/api-docs`
- Review the issues on GitHub
- Check Supabase and Prisma documentation
- Ensure all environment variables are set correctly

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using Next.js, TypeScript, Prisma, and Supabase