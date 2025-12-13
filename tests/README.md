# Integration Testing - Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- Both client and server running locally
- Database accessible

## Option 1: Automated Testing with Playwright (Recommended)

### Setup
```bash
cd tests
npm install
npx playwright install chromium
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# API integration tests only
npm run test:api

# E2E browser tests only
npm run test:e2e

# Run with browser visible (headed mode)
npm run test:headed

# Debug mode (step through tests)
npm run test:debug
```

### View Test Report
```bash
npm run test:report
```

## Option 2: Manual Testing

Follow the comprehensive checklist in `tests/MANUAL_TESTING_CHECKLIST.md`

Estimated time: 90 minutes for complete manual testing

## Option 3: Quick Smoke Test (5 minutes)

### Using Browser
1. Open http://localhost:5173
2. Register a new account
3. Generate a roadmap
4. Save the roadmap
5. Create a Kanban board from roadmap
6. Mark a task as complete
7. Logout and login again
8. Verify data persists

### Using API (curl/Postman)
```bash
# Test API health
curl http://localhost:8005/api/roadmap-templates

# Test roadmap generation
curl -X POST http://localhost:8005/api/generate-roadmap \
  -H "Content-Type: application/json" \
  -d '{"currentCourse":"Computer Science","targetRole":"Full Stack Developer"}'
```

## Test Results

After running tests, check:
- `test-results/html/index.html` - Visual test report
- `test-results/results.json` - Machine-readable results
- Console output for pass/fail summary

## Common Issues

### Tests Failing Due to Timing
- Increase timeout in `playwright.config.ts`
- Check if AI generation is taking longer than expected

### Database Connection Errors
- Verify `DATABASE_URL` in `.env`
- Check database is accessible

### CORS Errors
- Verify `CLIENT_ORIGIN` matches client URL
- Check CORS middleware is configured

## Production Deployment Checklist

Before deploying to production:

- [ ] All automated tests pass
- [ ] Manual testing checklist completed
- [ ] Environment variables configured for production
- [ ] Database migrations applied
- [ ] HTTPS/SSL configured
- [ ] Error logging set up
- [ ] Performance tested under expected load
- [ ] Security review completed
- [ ] Backup strategy in place
- [ ] Rollback plan documented

## Need Help?

- Check test logs in `test-results/`
- Review `MANUAL_TESTING_CHECKLIST.md` for detailed steps
- Verify both client and server are running
- Check browser console for errors
