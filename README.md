# CareerRoad - AI-Powered Career Roadmap Generator

A cutting-edge AI-powered career development platform designed to help Gen Z students and early graduates create personalized professional roadmaps with intelligent guidance and interactive learning experiences.

## 🚀 Features

- **AI-Powered Roadmap Generation**: Dynamic career roadmaps using Google's Gemini 2.5 Flash model
- **User Authentication**: Complete email/password authentication with secure session management
- **Password Reset**: Secure password reset functionality with time-limited tokens
- **Progress Tracking**: Individual task completion tracking with personal notes
- **Roadmap History**: Save and track multiple career roadmaps with progress persistence
- **Interactive UI**: Beautiful dark theme with animations and responsive design
- **Task Management**: Detailed task cards with completion status and notes functionality
- **Email Integration**: Send roadmaps via email for offline reference

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript with full type checking
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library with Radix UI primitives
- **Wouter** - Lightweight client-side routing
- **TanStack Query** - Server state management and caching
- **React Hook Form** - Form management with validation
- **Zod** - TypeScript-first schema validation
- **Lucide React** - Beautiful SVG icons
- **Framer Motion** - Smooth animations and transitions

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Full backend type safety
- **PostgreSQL** - Primary database via Supabase
- **Drizzle ORM** - Type-safe database operations
- **Express Sessions** - Session management with PostgreSQL storage
- **Scrypt** - Secure password hashing
- **Google Gemini AI** - AI-powered roadmap generation

### Database & Storage
- **Supabase PostgreSQL** - Cloud PostgreSQL database
- **Drizzle ORM** - Type-safe database operations with migrations
- **Connect-PG-Simple** - PostgreSQL session store
- **Database Tables**:
  - Users (authentication)
  - Sessions (session management)
  - Roadmap Templates (pre-built roadmaps)
  - Custom Roadmaps (user-generated content)
  - User Roadmap History (saved roadmaps)
  - User Roadmap Progress (task completion tracking)
  - Waitlist Entries (early user registration)

### Development Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **tsx** - TypeScript execution for development
- **Drizzle Kit** - Database migrations and schema management
- **Replit** - Development environment and hosting platform

## 🔧 Environment Variables

### Required Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# AI Service
GEMINI_API_KEY=your_gemini_api_key_here

# Session Security
SESSION_SECRET=your_secure_session_secret_here

# PostgreSQL Connection Details (Auto-provided by Supabase)
PGHOST=db.supabase.co
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_database_password
PGDATABASE=postgres
```

### Development Environment Variables

```bash
# Node Environment
NODE_ENV=development

# Vite Frontend Variables (prefixed with VITE_)
VITE_API_URL=http://localhost:5000
```

## 📦 Installation & Setup

> **📖 For detailed Windows setup instructions, see [LOCAL_SETUP.md](./LOCAL_SETUP.md)**

### Prerequisites
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **PostgreSQL database** - Use [Supabase](https://supabase.com) (free tier available) or install locally
- **Google Gemini API key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   - Copy `.env.example` to `.env` (or create `.env` manually)
   - Fill in your values:
     - `DATABASE_URL` - Your PostgreSQL connection string
     - `GEMINI_API_KEY` - Your Google Gemini API key
     - `SESSION_SECRET` - A random secure string

3. **Set Up Database**
   ```bash
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   - Navigate to `http://localhost:5000`

### Detailed Setup Instructions

For step-by-step instructions with troubleshooting, see **[LOCAL_SETUP.md](./LOCAL_SETUP.md)**.

### Environment Variables

Create a `.env` file in the root directory with:

```bash
# Required: Database connection string
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Required: Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key_here

# Required: Session secret (generate a random string)
SESSION_SECRET=your_secure_random_string_here

# Optional: Node environment
NODE_ENV=development
```

**Getting your values:**
- **DATABASE_URL**: From Supabase project → Settings → Database → Connection string
- **GEMINI_API_KEY**: From [Google AI Studio](https://makersuite.google.com/app/apikey)
- **SESSION_SECRET**: Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 🏗️ Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── data/           # Static data and configuration
├── server/                 # Backend Express application
│   ├── auth.ts            # Authentication middleware
│   ├── database.ts        # Database connection and queries
│   ├── gemini.ts          # AI service integration
│   ├── routes.ts          # API route definitions
│   └── storage.ts         # Data storage abstraction
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and validation
├── migrations/             # Database migration files
└── package.json           # Dependencies and scripts
```

## 🔒 Security Features

- **Password Hashing**: Scrypt-based password hashing with salt
- **Session Management**: Secure session storage in PostgreSQL
- **CSRF Protection**: Built-in CSRF protection
- **Input Validation**: Comprehensive Zod schema validation
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **Password Reset**: Secure token-based password reset with expiration

## 🎯 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user
- `POST /api/reset-password-request` - Request password reset
- `POST /api/reset-password` - Complete password reset

### Roadmap Management
- `GET /api/roadmap-templates` - Get all roadmap templates
- `GET /api/roadmap-templates/:key` - Get specific template
- `POST /api/generate-roadmap` - Generate AI-powered roadmap
- `POST /api/custom-roadmaps` - Create custom roadmap

### User Progress
- `GET /api/roadmap-history` - Get user's roadmap history
- `POST /api/save-roadmap` - Save roadmap to history
- `DELETE /api/roadmap-history/:id` - Delete saved roadmap
- `GET /api/roadmap-progress/:id` - Get task progress
- `POST /api/update-task-progress` - Update task completion

### Waitlist
- `POST /api/waitlist` - Join waitlist
- `GET /api/waitlist` - Get waitlist entries (admin)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Setup
Ensure all environment variables are properly configured in your production environment.

### Database Migration
```bash
npm run db:push
```

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run database migrations
npm run db:push

# Generate database schema
npm run db:generate

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📊 Database Schema

### Key Tables
- **users**: User authentication and profiles
- **sessions**: Session management
- **roadmap_templates**: Pre-built career roadmaps
- **user_roadmap_history**: User's saved roadmaps
- **user_roadmap_progress**: Individual task completion tracking
- **waitlist_entries**: Early user registration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

Built with ❤️ using modern web technologies and AI-powered career guidance.