# AWS Deployment Guide - CareerRoad

Complete guide to deploy CareerRoad on AWS infrastructure.

## 🎯 Deployment Options

We'll cover two main approaches:

1. **AWS Elastic Beanstalk** (Recommended for beginners) - Easiest, managed service
2. **EC2 Instance** (More control) - Full control, requires more setup

## 📋 Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Your application tested locally
- Production environment variables ready

## 🚀 Option 1: AWS Elastic Beanstalk (Recommended)

Elastic Beanstalk is the easiest way to deploy Node.js applications on AWS.

### Step 1: Install EB CLI

```bash
# Windows (using pip)
pip install awsebcli

# Or using Chocolatey
choco install awsebcli

# Verify installation
eb --version
```

### Step 2: Initialize Elastic Beanstalk

```bash
# In your project root
eb init

# Follow prompts:
# - Select region (e.g., us-east-1)
# - Select application type: Node.js
# - Select platform: Node.js 18 or 20
# - Set up SSH: Yes (for debugging)
# - Create keypair or use existing
```

### Step 3: Create Environment

```bash
# Create production environment
eb create careerroad-prod

# This will:
# - Create EC2 instance
# - Set up load balancer
# - Configure auto-scaling
# - Deploy your application
```

### Step 4: Configure Environment Variables

```bash
# Set environment variables
eb setenv DATABASE_URL="your_production_database_url" \
         GEMINI_API_KEY="your_gemini_key" \
         SESSION_SECRET="your_production_session_secret" \
         NODE_ENV="production"
```

### Step 5: Deploy

```bash
# Build and deploy
npm run build
eb deploy
```

### Step 6: Get Your URL

```bash
# Get your application URL
eb status
eb open  # Opens in browser
```

## 🖥️ Option 2: EC2 Instance Deployment

For more control, deploy directly to EC2.

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose:
   - **AMI**: Amazon Linux 2023 or Ubuntu 22.04 LTS
   - **Instance Type**: t3.small or t3.medium (for production)
   - **Key Pair**: Create or select existing
   - **Security Group**: 
     - Allow SSH (port 22) from your IP
     - Allow HTTP (port 80) from anywhere
     - Allow HTTPS (port 443) from anywhere
     - Allow custom TCP (port 5000) if needed

### Step 2: Connect to EC2

```bash
# SSH into your instance
ssh -i your-key.pem ec2-user@your-instance-ip

# For Ubuntu:
ssh -i your-key.pem ubuntu@your-instance-ip
```

### Step 3: Install Dependencies on EC2

```bash
# Update system
sudo yum update -y  # Amazon Linux
# OR
sudo apt update && sudo apt upgrade -y  # Ubuntu

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs  # Amazon Linux
# OR
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs  # Ubuntu

# Install Git
sudo yum install -y git  # Amazon Linux
# OR
sudo apt install -y git  # Ubuntu

# Install PM2 (process manager)
sudo npm install -g pm2
```

### Step 4: Clone and Setup Application

```bash
# Clone your repository
git clone https://github.com/yourusername/careerroad.git
cd careerroad

# Install dependencies
npm install --production

# Create .env file
nano .env
# Add your production environment variables
```

### Step 5: Build Application

```bash
# Build for production
npm run build

# Verify build
ls -la dist/
```

### Step 6: Set Up PM2

```bash
# Create PM2 ecosystem file (we'll create this)
pm2 start dist/index.js --name careerroad

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs
```

### Step 7: Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo yum install -y nginx  # Amazon Linux
# OR
sudo apt install -y nginx  # Ubuntu

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

Create Nginx configuration:

```bash
sudo nano /etc/nginx/conf.d/careerroad.conf
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Or use EC2 public IP

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 8: Set Up SSL with Let's Encrypt (Optional but Recommended)

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx  # Amazon Linux
# OR
sudo apt install -y certbot python3-certbot-nginx  # Ubuntu

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

## 🗄️ Database Options

### Option A: Keep Using Supabase (Easiest)

- No changes needed
- Your existing Supabase database works
- Just update `DATABASE_URL` in production environment

### Option B: Migrate to AWS RDS PostgreSQL

1. **Create RDS Instance:**
   - Go to AWS Console → RDS → Create Database
   - Choose PostgreSQL
   - Select instance size (db.t3.micro for testing)
   - Set master username and password
   - Configure security group to allow your EC2 instance

2. **Migrate Data:**
   ```bash
   # Export from Supabase
   pg_dump your_supabase_url > backup.sql
   
   # Import to RDS
   psql your_rds_endpoint < backup.sql
   ```

3. **Update DATABASE_URL:**
   ```
   DATABASE_URL=postgresql://username:password@rds-endpoint:5432/dbname
   ```

## 🔐 Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use AWS Systems Manager Parameter Store or Secrets Manager
- Rotate secrets regularly

### 2. Security Groups
- Only allow necessary ports
- Restrict SSH access to your IP
- Use HTTPS in production

### 3. Session Security
- Use strong `SESSION_SECRET` (32+ characters)
- Enable secure cookies in production:
  ```javascript
  cookie: {
    secure: true,  // HTTPS only
    httpOnly: true,
    sameSite: 'strict'
  }
  ```

### 4. Update Auth Configuration

Update `server/auth.ts` for production:

```typescript
cookie: {
  secure: true,  // Change from false
  maxAge: 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'strict'  // Change from 'lax'
}
```

## 📊 Monitoring & Logging

### CloudWatch Logs

```bash
# View application logs
eb logs  # Elastic Beanstalk
# OR
pm2 logs careerroad  # EC2 with PM2
```

### Set Up CloudWatch Alarms

1. Go to CloudWatch → Alarms
2. Create alarm for:
   - High CPU usage
   - High memory usage
   - Application errors

## 🔄 Continuous Deployment

### Option 1: GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - name: Deploy to EB
        uses: einaregilsson/beanstalk-deploy@v22
        with:
          aws_access_key: ${{ secrets.AWS_ACCESS_KEY }}
          aws_secret_key: ${{ secrets.AWS_SECRET_KEY }}
          application_name: careerroad
          environment_name: careerroad-prod
          version_label: ${{ github.sha }}
          region: us-east-1
```

### Option 2: Manual Deployment Script

See `deploy.sh` script (we'll create this).

## 💰 Cost Estimation

### Elastic Beanstalk (Recommended)
- **EC2 t3.small**: ~$15/month
- **Load Balancer**: ~$16/month
- **Data Transfer**: ~$0.09/GB
- **Total**: ~$35-50/month

### EC2 Direct
- **EC2 t3.small**: ~$15/month
- **Data Transfer**: ~$0.09/GB
- **Total**: ~$20-30/month

### RDS (if migrating)
- **db.t3.micro**: ~$15/month
- **Storage**: ~$0.10/GB/month
- **Total**: ~$20-30/month

**Note**: Supabase free tier is generous, so keeping it is cost-effective.

## 🚨 Troubleshooting

### Application won't start
```bash
# Check logs
eb logs
# OR
pm2 logs

# Check environment variables
eb printenv
# OR
pm2 env 0
```

### Database connection errors
- Verify `DATABASE_URL` is correct
- Check security groups allow connection
- Verify database is accessible from EC2

### Port already in use
```bash
# Find process using port 5000
sudo lsof -i :5000
# Kill it
sudo kill -9 <PID>
```

## 📝 Next Steps After Deployment

1. **Test the application:**
   - Register/login
   - Generate roadmaps
   - Test all features

2. **Set up domain:**
   - Point domain to your EC2/EB instance
   - Configure SSL certificate

3. **Monitor:**
   - Set up CloudWatch alarms
   - Monitor application logs
   - Track performance metrics

4. **Backup:**
   - Set up automated database backups
   - Document recovery procedures

## 🎯 Quick Deployment Checklist

- [ ] AWS account created
- [ ] Application tested locally
- [ ] Production environment variables prepared
- [ ] Database connection string ready
- [ ] Chosen deployment method (EB or EC2)
- [ ] Security groups configured
- [ ] SSL certificate set up (optional)
- [ ] Monitoring configured
- [ ] Backup strategy in place

---

**Ready to deploy?** Choose your method and follow the steps above!

For detailed EC2 deployment, see `EC2_DEPLOYMENT.md`
For Elastic Beanstalk, follow Option 1 above.

