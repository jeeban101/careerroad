# CareerRoad - Personalized Career Roadmap Generator

## Overview

CareerRoad is a full-stack web application that helps students and early graduates navigate their career paths by providing personalized, step-by-step roadmaps from their current education to their dream roles. The application now uses AI-powered roadmap generation with Google's Gemini 2.5 Flash model, providing more dynamic and personalized career guidance.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 11, 2025)

✓ COMPLETED: Enhanced resource card system for skill roadmaps with interactive preview capabilities
✓ COMPLETED: Implemented Open/Preview/Copy buttons for resource links with copy-to-clipboard functionality
✓ COMPLETED: Added lazy-loading metadata fetching (og:title, og:description) from external URLs
✓ COMPLETED: Built YouTube and CodePen embed support with responsive modal previews
✓ COMPLETED: Created comprehensive analytics tracking system for resource interactions
  - Tracks resource_opened, resource_previewed, and resource_copied events
  - Includes detailed payload data (roadmapId, stageIndex, resourceUrl, resourceType)
✓ COMPLETED: Implemented production-grade SSRF protection for resource metadata endpoint
  - Created `server/resourceSecurity.ts` security module with allowlist approach
  - Domain allowlist: 30+ approved domains (YouTube, CodePen, GitHub, educational platforms)
  - DNS resolution with private IP validation (IPv4/IPv6 comprehensive coverage)
  - Manual redirect handling with per-hop validation (max 5 redirects)
  - Protocol downgrade blocking (https → http blocked)
  - Comprehensive private IP blocking: localhost, RFC1918, link-local (169.254.x), CGNAT, IPv6
  - Structured logging for security monitoring
  - Defense-in-depth: protocol whitelist + allowlist + DNS/IP validation + redirect validation + timeout + sanitization
✓ COMPLETED: Fixed skill roadmap Kanban generation to save roadmap to history before task generation
✓ COMPLETED: Fixed history page null phases error for skill roadmaps
✓ COMPLETED: Updated AI to place all generated Kanban tasks in "todo" column initially
✓ COMPLETED: Implemented smart AI model fallback system (November 11, 2025)
  - Primary model: gemini-2.5-flash (user preference)
  - Automatic fallback to gemini-2.5-pro on 503 (overloaded) or 404 (not found) errors
  - Exponential backoff retry logic (1s, 2s, 4s delays) for API failures
  - Applied to all three AI functions: generateRoadmap, generateSkillRoadmap, generateKanbanTasksFromRoadmap
✓ COMPLETED: Fixed skill roadmap resource generation issues (November 11, 2025)
  - Updated AI prompt to generate only valid http/https URLs instead of placeholder text
  - Added frontend URL validation in ResourceCard component (graceful failure, returns null for invalid URLs)
  - Implemented server-side URL filtering as defense-in-depth (filters out non-URL strings before sending to frontend)
  - Fixed ResourceCard crash on invalid URL construction with try-catch validation
  - Resolved "Invalid URL format" 400 errors from resource-metadata endpoint

## Previous Changes (July 12, 2025)

✓ Redesigned landing page to match minimalist design requirements
✓ Implemented AI-powered roadmap generation using Gemini 2.5 Flash
✓ Simplified UI layout with clean, centered design
✓ Added dynamic roadmap generation API endpoint
✓ Updated color scheme to use gray tones instead of bright colors
✓ Streamlined hero section and removed complex features section
✓ Fixed button text visibility issue in roadmap display section
✓ Added comprehensive email collection functionality with modal
✓ Expanded dropdown options for courses and roles (40+ options total)
✓ Added manual entry option for custom courses and roles
✓ Enhanced user flexibility in career path selection
✓ FIXED: Migrated from in-memory storage to PostgreSQL database
✓ FIXED: Session management now uses PostgreSQL with proper persistence
✓ FIXED: Authentication system fully functional with database storage
✓ FIXED: All database tables created and working (users, sessions, roadmaps, etc.)
✓ FIXED: API endpoints tested and working correctly for registration/login
✓ FIXED: Replaced ORM with direct SQL queries for better performance and reliability
✓ FIXED: Database connection using native PostgreSQL client (pg package)
✓ FIXED: Session persistence tested and working correctly with cookies
✓ FIXED: Migrated from Neon to Supabase PostgreSQL database (July 11, 2025)
✓ FIXED: All database tables created in Supabase with proper foreign key relationships
✓ FIXED: Authentication system fully working with Supabase connection string
✓ FIXED: User registration and login tested and working with persistent sessions
✓ COMPLETED: Automatic roadmap saving functionality implemented
✓ COMPLETED: History page with full roadmap display and progress tracking
✓ COMPLETED: Toast notifications for successful roadmap generation and saving
✓ COMPLETED: Frontend-backend integration for seamless user experience
✓ COMPLETED: History button properly visible in navigation when logged in
✓ COMPLETED: Database verified with 3 saved roadmaps for testing
✓ COMPLETED: Enhanced UI with elegant save indicators and aesthetic design improvements
✓ COMPLETED: Roadmap display now shows "Saved to History" indicator for logged-in users
✓ COMPLETED: Removed all Neon database dependencies and packages
✓ COMPLETED: Updated Drizzle configuration to use postgres-js instead of Neon
✓ COMPLETED: Improved database configuration to use environment variables properly
✓ COMPLETED: Enhanced "My Roadmaps" button with prominent gradient styling and improved visibility
✓ COMPLETED: Fixed authentication context sharing between Header and Home components
✓ COMPLETED: Implemented direct user data fetching in Header component to ensure "My Roadmaps" button visibility
✓ COMPLETED: Implemented comprehensive task tracking system with notes functionality
✓ COMPLETED: Created TaskCard component with individual task progress tracking
✓ COMPLETED: Added notes feature for each task with save/edit functionality
✓ COMPLETED: Database schema updated with completed_at column for better tracking
✓ COMPLETED: API endpoints for individual task progress retrieval and updates
✓ COMPLETED: Enhanced History page with beautiful gradient design and call-to-action for new users
✓ COMPLETED: CRITICAL FIX - Saved roadmaps section text readability with proper dark backgrounds and high contrast
✓ COMPLETED: CRITICAL FIX - Roadmap display cards formatting and alignment with consistent spacing and styling
✓ COMPLETED: Full dark theme consistency across all application components with proper text contrast
✓ COMPLETED: Production-ready UI with professional dark theme suitable for deployment and presentation
✓ COMPLETED: Password reset functionality with secure token generation and email workflow
✓ COMPLETED: "Forgot Password" link added to authentication page with complete reset flow
✓ COMPLETED: Task card formatting alignment fixed between fresh roadmaps and history view
✓ COMPLETED: Created comprehensive documentation including README.md and TECH_STACK.md
✓ COMPLETED: Detailed environment variables documentation and setup instructions

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
- **Database**: PostgreSQL with direct SQL queries
- **Database Provider**: Supabase PostgreSQL (postgres-js client)
- **Session Management**: PostgreSQL-based session storage
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
- `POST /api/generate-roadmap` - Generate AI-powered roadmap using Gemini
- `POST /api/waitlist` - Create waitlist entry
- `GET /api/waitlist` - Retrieve waitlist entries
- `POST /api/custom-roadmaps` - Create customized roadmap

### Core Features
1. **Goal Selector Form**: Users select current course and target role
2. **AI-Powered Roadmap Generation**: Dynamic roadmaps created using Gemini 2.5 Flash
3. **Static Roadmap Templates**: Pre-written roadmaps stored in database as fallback
4. **Roadmap Display**: Timeline view with phases, skills, tools, and tasks
5. **Customization Modal**: Users can fork and modify roadmap templates
6. **Waitlist System**: Simplified user registration system

## Data Flow

1. **User Input**: User selects current course and target career role
2. **AI Generation**: System uses Gemini 2.5 Flash to generate personalized roadmap
3. **Template Fallback**: Falls back to static templates if AI generation fails
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
- Supabase PostgreSQL for database hosting
- postgres-js for database connectivity
- Google Gemini AI (@google/genai) for roadmap generation
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