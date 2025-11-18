# GitHub Setup Guide - Push Your Code

Step-by-step guide to push CareerRoad to GitHub before AWS deployment.

## 📋 Prerequisites

- GitHub account created
- Git installed (already have it)
- Code ready to push

## 🚀 Step-by-Step Instructions

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon → **"New repository"**
3. Fill in:
   - **Repository name**: `careerroad` (or your preferred name)
   - **Description**: "AI-Powered Career Roadmap Generator"
   - **Visibility**: Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

### Step 2: Add GitHub Remote

After creating the repository, GitHub will show you commands. Use these:

```bash
# Navigate to your project
cd D:\Downloads\CareerRoadmap\CareerRoadmap

# Add GitHub as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Or if you prefer SSH:
# git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git
```

**Example:**
```bash
git remote add origin https://github.com/yourusername/careerroad.git
```

### Step 3: Stage All Changes

```bash
# Add all files (respects .gitignore)
git add .

# Verify what will be committed
git status
```

### Step 4: Commit Changes

```bash
# Commit with a descriptive message
git commit -m "Add AWS deployment setup and local development configuration

- Add Windows compatibility with cross-env
- Create comprehensive AWS deployment guides
- Add EC2 and Elastic Beanstalk configurations
- Update security settings for production
- Add deployment scripts and PM2 config
- Create local setup documentation"
```

### Step 5: Push to GitHub

```bash
# Push to main branch
git push -u origin main

# If you get an error about branch name, try:
# git push -u origin master
```

### Step 6: Verify

1. Go to your GitHub repository page
2. You should see all your files
3. Verify `.env` file is **NOT** there (it's in .gitignore)

## 🔐 Important: What's NOT Pushed

Thanks to `.gitignore`, these files are **NOT** pushed to GitHub:
- ✅ `.env` - Your environment variables (secure!)
- ✅ `node_modules/` - Dependencies
- ✅ `dist/` - Build files
- ✅ `.local/` - Local files

## 📝 Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
# Create repo and push in one command
gh repo create careerroad --private --source=. --remote=origin --push
```

## 🚨 Troubleshooting

### Error: "remote origin already exists"
```bash
# Remove existing remote
git remote remove origin

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### Error: "failed to push some refs"
```bash
# Pull first, then push
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Error: Authentication required
```bash
# Use Personal Access Token instead of password
# Get token from: GitHub → Settings → Developer settings → Personal access tokens
# Then use token as password when prompted
```

### Want to keep the existing remote?
```bash
# Add GitHub as a different remote name
git remote add github https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u github main
```

## ✅ After Pushing

Once code is on GitHub:

1. **Verify files are there** - Check GitHub repository
2. **Verify .env is NOT there** - Important for security!
3. **Ready for EC2 deployment** - You can now clone on EC2

## 🔄 Future Updates

When you make changes:

```bash
# Stage changes
git add .

# Commit
git commit -m "Description of changes"

# Push
git push
```

## 📚 Next Steps

After pushing to GitHub:

1. ✅ Code is backed up on GitHub
2. ✅ Ready to clone on EC2
3. ✅ Can share with team members
4. ✅ Ready for CI/CD setup (optional)

---

**Ready to push?** Follow the steps above! 🚀

