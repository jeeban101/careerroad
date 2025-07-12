# CareerRoad - Complete Tech Stack Documentation

## 🏗️ Architecture Overview

CareerRoad follows a modern full-stack architecture with a React frontend, Express backend, and PostgreSQL database, enhanced with AI capabilities.

### Architecture Pattern
- **Frontend**: Single Page Application (SPA) with React
- **Backend**: RESTful API with Express.js
- **Database**: PostgreSQL with ORM abstraction
- **AI Integration**: Google Gemini API for dynamic content generation
- **Authentication**: Session-based authentication with PostgreSQL storage

## 🎨 Frontend Technology Stack

### Core Framework & Runtime
- **React 18.2.0** - Modern React with concurrent features
- **TypeScript 5.x** - Type-safe JavaScript development
- **Vite 5.x** - Fast build tool and development server with HMR

### UI & Styling
- **Tailwind CSS 3.x** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library built on Radix UI
- **Radix UI Primitives** - Unstyled, accessible UI components
- **Lucide React** - Beautiful SVG icon library
- **Framer Motion** - Animation library for smooth transitions

### State Management & Data Fetching
- **TanStack Query v5** - Server state management and caching
- **React Hook Form** - Performant form management
- **Zod** - TypeScript-first schema validation
- **Wouter** - Lightweight client-side routing (4KB)

### Development Tools
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **PostCSS** - CSS post-processing
- **Autoprefixer** - CSS vendor prefixing

## 🔧 Backend Technology Stack

### Core Runtime & Framework
- **Node.js 18+** - JavaScript runtime
- **Express.js 4.x** - Web application framework
- **TypeScript 5.x** - Full backend type safety
- **tsx** - TypeScript execution for development

### Database & ORM
- **PostgreSQL 15+** - Primary database (via Supabase)
- **Drizzle ORM** - Type-safe database operations
- **postgres.js** - PostgreSQL client library
- **Drizzle Kit** - Database migrations and schema management

### Authentication & Security
- **Express Session** - Session management middleware
- **Connect-PG-Simple** - PostgreSQL session store
- **Scrypt** - Secure password hashing (Node.js built-in)
- **CSRF Protection** - Built-in CSRF protection

### AI & External Services
- **Google Gemini API** - AI-powered roadmap generation
- **@google/genai** - Official Google AI SDK

## 🗄️ Database Technology Stack

### Primary Database
- **Supabase PostgreSQL** - Cloud PostgreSQL hosting
- **Connection Pooling** - Built-in connection management
- **SSL Connections** - Secure database connections

### Database Schema Management
- **Drizzle ORM Schema** - Type-safe schema definitions
- **Drizzle Migrations** - Version-controlled database changes
- **Zod Integration** - Runtime validation from database types

### Storage Strategy
- **PostgreSQL Tables**: All persistent data
- **Session Storage**: PostgreSQL-based session management
- **In-Memory Development**: MemStorage for local development

## 🔧 Development & Build Tools

### Package Management
- **npm** - Package manager
- **package-lock.json** - Dependency lock file

### Build & Development
- **Vite** - Frontend build tool and dev server
- **esbuild** - Fast JavaScript bundler (via Vite)
- **TypeScript Compiler** - Type checking and compilation

### Code Quality
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📦 Key Dependencies

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0",
  "vite": "^5.0.0",
  "@tanstack/react-query": "^5.0.0",
  "tailwindcss": "^3.0.0",
  "wouter": "^3.0.0",
  "react-hook-form": "^7.0.0",
  "zod": "^3.0.0",
  "lucide-react": "^0.400.0",
  "framer-motion": "^10.0.0"
}
```

### Backend Dependencies
```json
{
  "express": "^4.18.0",
  "typescript": "^5.0.0",
  "drizzle-orm": "^0.29.0",
  "postgres": "^3.4.0",
  "express-session": "^1.17.0",
  "connect-pg-simple": "^9.0.0",
  "@google/genai": "^0.2.0",
  "zod": "^3.0.0",
  "tsx": "^4.0.0"
}
```

## 🏗️ Project Structure

```
careerroad/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # Shadcn/ui components
│   │   │   ├── task-card.tsx  # Task management component
│   │   │   └── ...
│   │   ├── pages/             # Page components
│   │   │   ├── home-page.tsx  # Main application page
│   │   │   ├── auth-page.tsx  # Authentication page
│   │   │   └── history-page.tsx # Roadmap history
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.tsx    # Authentication hook
│   │   │   └── use-toast.tsx  # Toast notifications
│   │   ├── lib/               # Utility functions
│   │   │   ├── queryClient.ts # TanStack Query setup
│   │   │   └── utils.ts       # Helper functions
│   │   └── data/              # Static data
│   │       └── roadmapTemplates.ts
│   ├── index.html             # HTML entry point
│   └── vite.config.ts         # Vite configuration
├── server/                    # Backend Express application
│   ├── auth.ts               # Authentication middleware
│   ├── database.ts           # Database connection & queries
│   ├── gemini.ts             # AI service integration
│   ├── routes.ts             # API route definitions
│   ├── storage.ts            # Data storage abstraction
│   ├── db.ts                 # Database connection
│   └── index.ts              # Express server entry
├── shared/                   # Shared types and schemas
│   └── schema.ts             # Database schema & validation
├── migrations/               # Database migration files
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── drizzle.config.ts         # Drizzle ORM configuration
└── vite.config.ts            # Vite build configuration
```

## 🔐 Security Implementation

### Authentication Security
- **Password Hashing**: Scrypt with salt (Node.js built-in)
- **Session Management**: Secure session storage in PostgreSQL
- **CSRF Protection**: Built-in Express CSRF protection
- **Session Expiration**: Configurable session timeout

### Data Security
- **Input Validation**: Comprehensive Zod schema validation
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **Type Safety**: Full TypeScript coverage
- **Environment Variables**: Secure configuration management

### API Security
- **Rate Limiting**: Built-in Express rate limiting
- **CORS Configuration**: Proper CORS setup
- **Headers Security**: Security headers middleware
- **Authentication Middleware**: Protected route authentication

## 🚀 Performance Optimizations

### Frontend Performance
- **Code Splitting**: Vite automatic code splitting
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: Vite asset optimization
- **Lazy Loading**: React lazy loading for components

### Backend Performance
- **Database Connection Pooling**: PostgreSQL connection pooling
- **Query Optimization**: Drizzle ORM query optimization
- **Session Caching**: Efficient session management
- **Memory Management**: Proper resource cleanup

### Database Performance
- **Indexing**: Proper database indexing
- **Query Optimization**: Efficient SQL queries
- **Connection Pooling**: Managed database connections
- **Migration Strategy**: Non-blocking database migrations

## 🧪 Testing Strategy

### Frontend Testing
- **Component Testing**: React Testing Library
- **Type Checking**: TypeScript compilation
- **Linting**: ESLint configuration
- **Build Testing**: Vite build verification

### Backend Testing
- **API Testing**: Manual API testing
- **Database Testing**: Migration testing
- **Type Safety**: TypeScript compilation
- **Integration Testing**: End-to-end flow testing

## 📊 Monitoring & Logging

### Development Monitoring
- **Console Logging**: Structured logging
- **Error Tracking**: Error boundary implementation
- **Performance Monitoring**: React DevTools
- **Network Monitoring**: TanStack Query DevTools

### Production Monitoring
- **Server Logs**: Express logging middleware
- **Database Logs**: PostgreSQL query logging
- **Error Tracking**: Centralized error logging
- **Performance Metrics**: Application performance monitoring

## 🔄 Deployment Strategy

### Build Process
- **Frontend Build**: Vite production build
- **Backend Build**: TypeScript compilation
- **Asset Optimization**: Vite asset optimization
- **Environment Configuration**: Production environment setup

### Deployment Targets
- **Replit Deployment**: Primary deployment platform
- **Static Assets**: CDN deployment for assets
- **Database**: Supabase PostgreSQL hosting
- **Environment Variables**: Secure configuration management

This comprehensive tech stack provides a robust, scalable, and maintainable foundation for the CareerRoad application.