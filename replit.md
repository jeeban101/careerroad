# CareerRoad - Personalized Career Roadmap Generator

## Overview

CareerRoad is a full-stack web application that helps students and early graduates navigate their career paths by providing personalized, step-by-step roadmaps from their current education to their dream roles. The application generates structured career guidance based on the user's current course (e.g., B.Com, B.Tech) and target career role (e.g., Product Manager, Data Analyst).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for client-side navigation
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: In-memory storage for development (MemStorage class)
- **API Design**: RESTful API with JSON responses

### Data Storage Solutions
- **Database**: PostgreSQL as the primary database
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle migrations with schema defined in TypeScript
- **Development Storage**: In-memory storage implementation for local development

## Key Components

### Database Schema
- **Users**: Basic user authentication (id, username, password)
- **Waitlist Entries**: Early user registration (name, email, college, confusion)
- **Roadmap Templates**: Pre-defined career roadmaps with structured phases
- **Custom Roadmaps**: User-customized versions of templates

### API Endpoints
- `GET /api/roadmap-templates` - Retrieve all available roadmap templates
- `GET /api/roadmap-templates/:key` - Get specific roadmap template
- `POST /api/waitlist` - Create waitlist entry
- `GET /api/waitlist` - Retrieve waitlist entries
- `POST /api/custom-roadmaps` - Create customized roadmap

### Core Features
1. **Goal Selector Form**: Users select current course and target role
2. **Static Roadmap Templates**: Pre-written roadmaps stored in database
3. **Roadmap Display**: Timeline view with phases, skills, tools, and tasks
4. **Customization Modal**: Users can fork and modify roadmap templates
5. **Waitlist System**: Early user registration and feedback collection

## Data Flow

1. **User Input**: User selects current course and target career role
2. **Template Matching**: System generates roadmap key from user selections
3. **Database Query**: Fetch corresponding roadmap template from database
4. **Roadmap Rendering**: Display structured roadmap with phases and items
5. **Customization**: Users can fork roadmaps and create custom versions
6. **Persistence**: Custom roadmaps saved to database with user modifications

## External Dependencies

### Frontend Dependencies
- React ecosystem (@tanstack/react-query, react-hook-form, wouter)
- UI components (Radix UI primitives, Lucide React icons)
- Styling (Tailwind CSS, class-variance-authority)
- Form validation (Zod with react-hook-form resolvers)

### Backend Dependencies
- Express.js for server framework
- Drizzle ORM for database operations
- Neon Database for PostgreSQL hosting
- Development tools (tsx, esbuild, Vite)

### Development Tools
- TypeScript for type safety
- ESLint and Prettier for code quality
- Vite for development server and build process
- Drizzle Kit for database migrations

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations handle schema changes

### Environment Configuration
- Development: Uses in-memory storage and local development server
- Production: Requires `DATABASE_URL` environment variable for PostgreSQL connection
- Build commands: `npm run build` creates production-ready assets

### Server Setup
- Express server serves both API routes and static frontend files
- Development mode includes Vite middleware for hot reloading
- Production mode serves pre-built static files
- Database connection configured through environment variables

### Key Architectural Decisions

1. **Monorepo Structure**: Frontend (`client/`), backend (`server/`), and shared code (`shared/`) in single repository
2. **Type Safety**: Shared TypeScript schemas between frontend and backend using Drizzle-Zod
3. **Static Templates**: Pre-written roadmaps stored in database rather than AI-generated content
4. **In-Memory Development**: MemStorage class for local development without database setup
5. **Component-Based UI**: Modular React components with shadcn/ui for consistent design system