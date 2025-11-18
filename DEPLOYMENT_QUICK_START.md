# AWS Deployment Quick Start

Choose your deployment method and follow the steps.

## 🎯 Choose Your Method

### Option 1: Elastic Beanstalk (Easiest) ⭐ Recommended
- ✅ Fully managed
- ✅ Auto-scaling
- ✅ Load balancing
- ✅ Easy updates
- **Time**: ~30 minutes
- **Cost**: ~$35-50/month

### Option 2: EC2 Direct (More Control)
- ✅ Full control
- ✅ Lower cost
- ✅ Custom configuration
- **Time**: ~1-2 hours
- **Cost**: ~$20-30/month

## 🚀 Elastic Beanstalk Quick Start

```bash
# 1. Install EB CLI
pip install awsebcli

# 2. Initialize
eb init

# 3. Create environment
eb create careerroad-prod

# 4. Set environment variables
eb setenv DATABASE_URL="your_db_url" \
         GEMINI_API_KEY="your_key" \
         SESSION_SECRET="your_secret" \
         NODE_ENV="production"

# 5. Build and deploy
npm run build
eb deploy

# 6. Open your app
eb open
```

**Full guide**: See `AWS_DEPLOYMENT.md` → Option 1

## 🖥️ EC2 Quick Start

```bash
# 1. Launch EC2 instance (t3.small, Amazon Linux/Ubuntu)
# 2. Configure security group (SSH, HTTP, HTTPS)
# 3. SSH into instance
ssh -i key.pem ec2-user@your-ip

# 4. Install Node.js, Git, PM2, Nginx
# 5. Clone your repo
git clone your-repo-url
cd careerroad

# 6. Install and build
npm install --production
npm run build

# 7. Create .env file with production variables
# 8. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 9. Configure Nginx (see EC2_DEPLOYMENT.md)
# 10. Set up SSL (optional)
sudo certbot --nginx -d your-domain.com
```

**Full guide**: See `EC2_DEPLOYMENT.md`

## 📋 Pre-Deployment Checklist

- [ ] Application tested locally
- [ ] Production `.env` variables ready:
  - [ ] `DATABASE_URL`
  - [ ] `GEMINI_API_KEY`
  - [ ] `SESSION_SECRET` (strong, random)
  - [ ] `NODE_ENV=production`
- [ ] AWS account created
- [ ] AWS CLI configured (for EB)
- [ ] Domain name ready (optional)

## 🔐 Production Environment Variables

Create these in your production environment:

```bash
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
GEMINI_API_KEY=your_production_gemini_key
SESSION_SECRET=generate_strong_random_string_here
NODE_ENV=production
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📚 Documentation Files

- **AWS_DEPLOYMENT.md** - Complete deployment guide (both methods)
- **EC2_DEPLOYMENT.md** - Detailed EC2 step-by-step
- **DEPLOYMENT_QUICK_START.md** - This file (quick reference)

## 🆘 Need Help?

1. Check the detailed guides above
2. Review troubleshooting sections
3. Check application logs:
   - EB: `eb logs`
   - EC2: `pm2 logs careerroad`

## ✅ After Deployment

1. Test your application
2. Set up monitoring
3. Configure backups
4. Set up domain (optional)
5. Enable SSL/HTTPS

---

**Ready?** Choose your method and start deploying! 🚀

