# Quick Start Guide

Get CareerRoad running on your local machine in 5 minutes!

## Prerequisites Check

- ✅ Node.js 18+ installed
- ✅ PostgreSQL database (use [Supabase](https://supabase.com) - free tier)
- ✅ Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Create a `.env` file in the root directory:

```bash
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=generate_a_random_string_here
NODE_ENV=development
```

**Quick way to generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Set Up Database
```bash
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Browser
Navigate to: **http://localhost:5000**

## Verify Setup

Run the setup check script:
```bash
npm run setup-check
```

This will verify:
- ✅ Node.js version
- ✅ Environment variables
- ✅ Dependencies installed
- ✅ Configuration files

## Troubleshooting

### Port 5000 already in use?
Find and kill the process:
```bash
# Windows PowerShell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database connection error?
- Verify your `DATABASE_URL` is correct
- Check Supabase project is active
- Ensure database password is correct

### Missing dependencies?
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Register an account** - Create your first user account
2. **Generate a roadmap** - Try the AI-powered roadmap generator
3. **Explore features** - Check out the dashboard, history, and Kanban boards

## Need More Help?

See **[LOCAL_SETUP.md](./LOCAL_SETUP.md)** for detailed instructions and troubleshooting.

---

**Happy coding! 🚀**

