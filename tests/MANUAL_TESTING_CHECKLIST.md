# CareerRoad - Manual Integration Testing Checklist

## Pre-Test Setup
- [ ] Both client (port 5173) and server (port 8005) are running
- [ ] Database is accessible and migrations are applied
- [ ] Environment variables are properly configured
- [ ] Browser is open to http://localhost:5173

---

## 1. Authentication Flow (10 minutes)

### Registration
- [ ] Navigate to Sign Up page
- [ ] Fill in valid email, password, first name, last name
- [ ] Click "Sign Up" button
- [ ] **Expected**: Redirected to dashboard with welcome message
- [ ] **Expected**: User name appears in header/sidebar

### Login
- [ ] Logout (if logged in)
- [ ] Navigate to Login page
- [ ] Enter valid credentials
- [ ] Click "Login" button
- [ ] **Expected**: Redirected to dashboard
- [ ] **Expected**: Session persists after page refresh

### Logout
- [ ] Click "Logout" button
- [ ] **Expected**: Redirected to login/home page
- [ ] **Expected**: Cannot access protected routes

---

## 2. Roadmap Generation (15 minutes)

### Career Roadmap
- [ ] Login to application
- [ ] Click "Generate Roadmap" or similar
- [ ] Select "Career Roadmap" option
- [ ] Enter Current Course: "Computer Science"
- [ ] Enter Target Role: "Full Stack Developer"
- [ ] Click "Generate" button
- [ ] **Expected**: Loading indicator appears
- [ ] **Expected**: Roadmap with multiple phases appears (within 30 seconds)
- [ ] **Expected**: Each phase has tasks/milestones
- [ ] **Expected**: Roadmap is visually appealing and readable

### Skill Roadmap
- [ ] Click "Generate Skill Roadmap"
- [ ] Enter Skill: "React"
- [ ] Select Proficiency Level: "Intermediate"
- [ ] Select Time Frame: "3 months"
- [ ] Click "Generate" button
- [ ] **Expected**: Skill roadmap appears with learning path
- [ ] **Expected**: Resources and milestones are included

---

## 3. Roadmap Management (10 minutes)

### Save Roadmap
- [ ] Generate a roadmap (if not already done)
- [ ] Click "Save" or "Save Roadmap" button
- [ ] **Expected**: Success message appears
- [ ] **Expected**: Roadmap appears in "My Roadmaps" or "Saved Roadmaps"

### View Saved Roadmaps
- [ ] Navigate to "My Roadmaps" page
- [ ] **Expected**: List of saved roadmaps appears
- [ ] **Expected**: Each roadmap shows title, type, date saved

### Delete Roadmap
- [ ] Click delete/trash icon on a saved roadmap
- [ ] Confirm deletion
- [ ] **Expected**: Roadmap removed from list
- [ ] **Expected**: Confirmation message appears

---

## 4. Progress Tracking (10 minutes)

### Mark Task as Complete
- [ ] Open a saved roadmap
- [ ] Find a task with a checkbox
- [ ] Click checkbox to mark as complete
- [ ] **Expected**: Checkbox is checked
- [ ] **Expected**: Progress bar updates
- [ ] **Expected**: "Progress saved" message appears

### View Progress Statistics
- [ ] Navigate to Dashboard
- [ ] **Expected**: Stats show total roadmaps, completed tasks, etc.
- [ ] **Expected**: Progress percentage is accurate

### Add Notes to Task
- [ ] Open a roadmap
- [ ] Click on a task to expand details
- [ ] Add notes in the notes field
- [ ] Save notes
- [ ] **Expected**: Notes are saved and persist

---

## 5. Kanban Board Integration (15 minutes)

### Generate Kanban from Roadmap
- [ ] Open a roadmap from history
- [ ] Click "Create Kanban Board" or similar
- [ ] **Expected**: Loading indicator appears
- [ ] **Expected**: Kanban board is created (within 30 seconds)
- [ ] **Expected**: Redirected to Kanban board view

### View Kanban Board
- [ ] Navigate to "Kanban" or "Boards" page
- [ ] **Expected**: List of boards appears
- [ ] Click on a board
- [ ] **Expected**: Board opens with columns (To Do, In Progress, Done)
- [ ] **Expected**: Tasks are distributed across columns

### Move Tasks Between Columns
- [ ] Drag a task from "To Do" to "In Progress"
- [ ] **Expected**: Task moves smoothly
- [ ] **Expected**: Task position is saved
- [ ] Refresh page
- [ ] **Expected**: Task is still in "In Progress"

### Create New Task
- [ ] Click "Add Task" or "+" button
- [ ] Enter task title and description
- [ ] Select priority
- [ ] Click "Create" or "Save"
- [ ] **Expected**: Task appears in "To Do" column

### Edit Task
- [ ] Click on a task to open details
- [ ] Edit title, description, or priority
- [ ] Save changes
- [ ] **Expected**: Changes are saved and visible

### Delete Task
- [ ] Click delete icon on a task
- [ ] Confirm deletion
- [ ] **Expected**: Task is removed from board

---

## 6. Resume Analysis (if available) (10 minutes)

### Upload Resume
- [ ] Navigate to Resume Analysis page
- [ ] Click "Upload Resume" button
- [ ] Select a PDF or DOCX file (< 5MB)
- [ ] **Expected**: File uploads successfully
- [ ] **Expected**: Analysis begins

### View Analysis Results
- [ ] Wait for analysis to complete (< 30 seconds)
- [ ] **Expected**: Skills identified are displayed
- [ ] **Expected**: Recommendations are provided
- [ ] **Expected**: Gap analysis is shown

### Generate Roadmap from Resume
- [ ] Click "Generate Roadmap" from analysis results
- [ ] **Expected**: Roadmap is generated based on resume
- [ ] **Expected**: Roadmap addresses identified gaps

---

## 7. Error Handling & Edge Cases (10 minutes)

### Invalid Login
- [ ] Try to login with wrong password
- [ ] **Expected**: Error message "Invalid credentials"
- [ ] **Expected**: User stays on login page

### Empty Form Submission
- [ ] Try to generate roadmap with empty fields
- [ ] **Expected**: Validation errors appear
- [ ] **Expected**: Form does not submit

### Network Error Simulation
- [ ] Stop the server (Ctrl+C in server terminal)
- [ ] Try to perform an action (e.g., save roadmap)
- [ ] **Expected**: Error message appears
- [ ] **Expected**: User-friendly error (not technical stack trace)
- [ ] Restart server and verify recovery

### Large File Upload
- [ ] Try to upload a file > 5MB
- [ ] **Expected**: Error message "File too large"
- [ ] **Expected**: Upload is rejected

---

## 8. Session & Security (5 minutes)

### Session Persistence
- [ ] Login to application
- [ ] Refresh page
- [ ] **Expected**: Still logged in
- [ ] Close browser and reopen
- [ ] Navigate to application
- [ ] **Expected**: Still logged in (if "Remember me" was checked)

### Protected Routes
- [ ] Logout
- [ ] Try to access /dashboard directly
- [ ] **Expected**: Redirected to login page
- [ ] Try to access /kanban directly
- [ ] **Expected**: Redirected to login page

---

## 9. UI/UX Verification (10 minutes)

### Responsive Design
- [ ] Resize browser to mobile width (< 768px)
- [ ] **Expected**: Layout adapts to mobile view
- [ ] **Expected**: Navigation menu collapses to hamburger
- [ ] **Expected**: All features are accessible

### Loading States
- [ ] Observe loading indicators during AI generation
- [ ] **Expected**: Spinner or skeleton loader appears
- [ ] **Expected**: User knows something is happening

### Error Messages
- [ ] Trigger various errors (invalid input, network error)
- [ ] **Expected**: Error messages are clear and helpful
- [ ] **Expected**: Errors are displayed prominently

### Success Feedback
- [ ] Perform successful actions (save, delete, update)
- [ ] **Expected**: Success messages appear
- [ ] **Expected**: Messages disappear after a few seconds

---

## 10. Performance Check (5 minutes)

### Page Load Time
- [ ] Measure time to load dashboard
- [ ] **Expected**: < 3 seconds on good connection

### AI Generation Time
- [ ] Measure time to generate roadmap
- [ ] **Expected**: < 30 seconds for career roadmap
- [ ] **Expected**: < 20 seconds for skill roadmap

### API Response Time
- [ ] Open browser DevTools Network tab
- [ ] Perform various actions
- [ ] **Expected**: Most API calls < 2 seconds
- [ ] **Expected**: No failed requests (except intentional errors)

---

## 11. Production Environment Checks

### Environment Variables
- [ ] Verify `DATABASE_URL` is set correctly
- [ ] Verify `GEMINI_API_KEY` is valid
- [ ] Verify `SESSION_SECRET` is secure (not default)
- [ ] Verify `NODE_ENV=production` for production build
- [ ] Verify `CLIENT_ORIGIN` matches production URL

### Database Connection
- [ ] Check server logs for successful database connection
- [ ] **Expected**: "PostgreSQL initial connectivity check passed"
- [ ] **Expected**: No connection errors

### CORS Configuration
- [ ] Check browser console for CORS errors
- [ ] **Expected**: No CORS errors
- [ ] **Expected**: API requests succeed from client

### Error Logging
- [ ] Trigger an error
- [ ] Check server logs
- [ ] **Expected**: Error is logged with details
- [ ] **Expected**: Stack trace is available for debugging

---

## Test Results Summary

### Passed Tests
- [ ] Authentication: ___ / ___ tests passed
- [ ] Roadmap Generation: ___ / ___ tests passed
- [ ] Roadmap Management: ___ / ___ tests passed
- [ ] Progress Tracking: ___ / ___ tests passed
- [ ] Kanban Boards: ___ / ___ tests passed
- [ ] Resume Analysis: ___ / ___ tests passed
- [ ] Error Handling: ___ / ___ tests passed
- [ ] Session & Security: ___ / ___ tests passed
- [ ] UI/UX: ___ / ___ tests passed
- [ ] Performance: ___ / ___ tests passed
- [ ] Production Checks: ___ / ___ tests passed

### Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Critical Blockers (must fix before production)
- [ ] None found
- [ ] List critical issues:
  - _______________________________________________

### Recommendation
- [ ] **READY FOR PRODUCTION** - All tests passed
- [ ] **NEEDS FIXES** - Minor issues to address
- [ ] **NOT READY** - Critical issues found

---

## Tester Information
- **Tester Name**: _______________________
- **Test Date**: _______________________
- **Test Duration**: _______ minutes
- **Browser**: _______________________
- **OS**: _______________________
