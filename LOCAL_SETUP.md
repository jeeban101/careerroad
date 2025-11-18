# Local Development Setup Guide

This guide will help you set up CareerRoad on your local Windows machine.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` (should be 18 or higher)
   - Verify npm: `npm --version`

2. **PostgreSQL Database** - You have two options:
   - **Option A (Recommended)**: Use Supabase (Free tier available)
     - Sign up at [supabase.com](https://supabase.com)
     - Create a new project
     - Get your database connection string from Project Settings → Database
   - **Option B**: Install PostgreSQL locally
     - Download from [postgresql.org](https://www.postgresql.org/download/windows/)
     - Create a database named `careerroad`

3. **Google Gemini API Key** (Required for AI features)
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Free tier available with generous limits

## Step-by-Step Setup

### 1. Clone or Navigate to the Project

```bash
cd D:\Downloads\CareerRoadmap\CareerRoadmap
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including `cross-env` for Windows compatibility.

### 3. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` in a text editor and fill in your values:

   **DATABASE_URL** (Required)
   - If using Supabase:
     - Go to your Supabase project → Settings → Database
     - Copy the connection string (URI format)
     - Replace `[YOUR-PASSWORD]` with your database password
     - Example: `postgresql://postgres:yourpassword@db.abcdefgh.supabase.co:5432/postgres`
   
   - If using local PostgreSQL:
     - Format: `postgresql://username:password@localhost:5432/careerroad`
     - Example: `postgresql://postgres:mypassword@localhost:5432/careerroad`

   **GEMINI_API_KEY** (Required)
   - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Paste your API key: `GEMINI_API_KEY=AIzaSy...`

   **SESSION_SECRET** (Required)
   - Generate a random string for security
   - You can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Or use an online generator
   - Example: `SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

   **NODE_ENV** (Optional)
   - Set to `development` for local development
   - Already set in `.env.example`

### 4. Set Up the Database

Run the database migrations to create all required tables:

```bash
npm run db:push
```

This will:
- Connect to your database
- Create all necessary tables (users, sessions, roadmaps, etc.)
- Set up the schema

**Troubleshooting:**
- If you get a connection error, verify your `DATABASE_URL` is correct
- Make sure your database is accessible (Supabase allows connections by default)
- For local PostgreSQL, ensure the service is running

### 5. Start the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5000`

**What happens:**
- Backend Express server starts on port 5000
- Frontend Vite dev server runs with hot module replacement
- Both are served through the same port

### 6. Verify Everything Works

1. Open your browser and go to: `http://localhost:5000`
2. You should see the landing page
3. Try registering a new account
4. Try generating a roadmap (requires GEMINI_API_KEY)

## Common Issues & Solutions

### Issue: "DATABASE_URL environment variable is required"

**Solution:** Make sure you created `.env` file in the root directory with `DATABASE_URL` set.

### Issue: "Failed to connect to database"

**Solutions:**
- Verify your `DATABASE_URL` is correct
- Check if your database is accessible (Supabase should work immediately)
- For local PostgreSQL, ensure the service is running
- Check firewall settings if using remote database

### Issue: "GEMINI_API_KEY is not set"

**Solution:** Add your Google Gemini API key to the `.env` file.

### Issue: Port 5000 is already in use

**Solution:** 
- Find what's using port 5000: `netstat -ano | findstr :5000`
- Kill the process or change the port in `server/index.ts` (line 62)

### Issue: Scripts don't work on Windows

**Solution:** We've added `cross-env` to handle Windows compatibility. Make sure you ran `npm install`.

### Issue: "Module not found" errors

**Solution:**
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

## Project Structure

```
CareerRoadmap/
├── client/              # React frontend
│   └── src/
│       ├── components/  # UI components
│       ├── pages/      # Page components
│       └── ...
├── server/             # Express backend
│   ├── index.ts       # Server entry point
│   ├── routes.ts      # API routes
│   ├── auth.ts        # Authentication
│   └── ...
├── shared/             # Shared TypeScript types
│   └── schema.ts      # Database schema
├── migrations/         # Database migrations
├── .env               # Your environment variables (not in git)
├── .env.example       # Example environment file
└── package.json       # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server (with hot reload)
- `npm run build` - Build for production
- `npm run start` - Start production server (after build)
- `npm run check` - Type check TypeScript
- `npm run db:push` - Push database schema changes

## Next Steps

Once everything is running:

1. **Test the application:**
   - Register a new account
   - Generate a career roadmap
   - Save roadmaps to history
   - Track progress on tasks

2. **Development:**
   - Make changes to code
   - Changes will hot-reload automatically
   - Check browser console for errors

3. **Database:**
   - All data is stored in PostgreSQL
   - Use Supabase dashboard to view data
   - Or use a PostgreSQL client like pgAdmin

## Production Deployment

When ready to deploy:

1. Set `NODE_ENV=production` in your production environment
2. Run `npm run build` to create production build
3. Set all environment variables in your hosting platform
4. Run `npm run db:push` on production database
5. Start with `npm run start`

## Getting Help

If you encounter issues:

1. Check the error message carefully
2. Verify all environment variables are set correctly
3. Check that all prerequisites are installed
4. Review the logs in the terminal
5. Check the browser console for frontend errors

## Security Notes

- **Never commit `.env` file** - It's already in `.gitignore`
- **Use strong SESSION_SECRET** in production
- **Keep your API keys secure** - Don't share them
- **Use HTTPS in production** - Update session cookie settings

---

Happy coding! 🚀

