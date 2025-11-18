# EC2 Step-by-Step Deployment Guide

Detailed guide for deploying CareerRoad on an EC2 instance.

## 📋 Prerequisites Checklist

- [ ] AWS Account
- [ ] EC2 instance launched
- [ ] Security group configured
- [ ] Key pair downloaded
- [ ] Application tested locally

## 🚀 Step-by-Step Instructions

### Step 1: Launch EC2 Instance

1. **Go to AWS Console** → EC2 → Launch Instance

2. **Configure Instance:**
   - **Name**: `careerroad-production`
   - **AMI**: Amazon Linux 2023 or Ubuntu 22.04 LTS
   - **Instance Type**: `t3.small` (2 vCPU, 2 GB RAM) - minimum for production
   - **Key Pair**: Create new or select existing
   - **Network Settings**: 
     - Create security group
     - Allow SSH (22) from your IP
     - Allow HTTP (80) from anywhere (0.0.0.0/0)
     - Allow HTTPS (443) from anywhere (0.0.0.0/0)

3. **Launch Instance**

4. **Note your:**
   - Public IP address
   - Instance ID

### Step 2: Connect to EC2

```bash
# For Amazon Linux
ssh -i your-key.pem ec2-user@your-ec2-public-ip

# For Ubuntu
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### Step 3: Initial Server Setup

```bash
# Update system
sudo yum update -y  # Amazon Linux
# OR
sudo apt update && sudo apt upgrade -y  # Ubuntu

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs  # Amazon Linux

# OR for Ubuntu:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v20.x.x
npm --version

# Install Git
sudo yum install -y git  # Amazon Linux
# OR
sudo apt install -y git  # Ubuntu

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx
sudo yum install -y nginx  # Amazon Linux
# OR
sudo apt install -y nginx  # Ubuntu
```

### Step 4: Clone Your Repository

```bash
# Create app directory
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app

# Clone your repository
# Option 1: If using GitHub
git clone https://github.com/yourusername/careerroad.git .

# Option 2: If using private repo, set up SSH keys first
# Option 3: Upload files using SCP (see below)
```

**Alternative: Upload Files with SCP**

From your local machine:

```bash
# Create a deployment package (excluding node_modules, .env, etc.)
tar --exclude='node_modules' --exclude='.git' --exclude='.env' \
    --exclude='dist' -czf careerroad.tar.gz .

# Upload to EC2
scp -i your-key.pem careerroad.tar.gz ec2-user@your-ec2-ip:/home/ec2-user/app/

# On EC2, extract
cd /home/ec2-user/app
tar -xzf careerroad.tar.gz
```

### Step 5: Install Dependencies

```bash
cd /home/ec2-user/app

# Install production dependencies
npm install --production

# Install build dependencies temporarily
npm install --save-dev
```

### Step 6: Create Production Environment File

```bash
# Create .env file
nano .env
```

Add your production environment variables:

```bash
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
GEMINI_API_KEY=your_production_gemini_key
SESSION_SECRET=your_strong_random_secret_here
NODE_ENV=production
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save and exit (Ctrl+X, Y, Enter)

### Step 7: Build Application

```bash
# Build for production
npm run build

# Verify build
ls -la dist/
# Should see: index.js and public/ directory
```

### Step 8: Configure PM2

```bash
# Start application with PM2
pm2 start ecosystem.config.js

# Or manually:
pm2 start dist/index.js --name careerroad --env production

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Copy and run the command it outputs (something like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user
```

**Verify PM2 is running:**
```bash
pm2 status
pm2 logs careerroad
```

### Step 9: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/conf.d/careerroad.conf
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or EC2 IP

    # Logging
    access_log /var/log/nginx/careerroad-access.log;
    error_log /var/log/nginx/careerroad-error.log;

    # Proxy to Node.js application
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
        
        # Timeouts
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/api/health;
        access_log off;
    }
}
```

```bash
# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

### Step 10: Set Up SSL (Optional but Recommended)

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx  # Amazon Linux
# OR
sudo apt install -y certbot python3-certbot-nginx  # Ubuntu

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 11: Configure Firewall (Security Group)

In AWS Console → EC2 → Security Groups:

1. Select your instance's security group
2. Edit inbound rules:
   - SSH (22) - Your IP only
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
   - Custom TCP (5000) - Remove this (not needed with Nginx)

### Step 12: Test Your Application

1. **Get your EC2 public IP** from AWS Console
2. **Open in browser**: `http://your-ec2-ip` or `https://your-domain.com`
3. **Test:**
   - Register/login
   - Generate roadmap
   - Check all features

### Step 13: Set Up Monitoring

```bash
# View PM2 logs
pm2 logs careerroad

# View Nginx logs
sudo tail -f /var/log/nginx/careerroad-access.log
sudo tail -f /var/log/nginx/careerroad-error.log

# Monitor PM2
pm2 monit
```

## 🔄 Updating Your Application

When you need to deploy updates:

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Navigate to app directory
cd /home/ec2-user/app

# Pull latest changes
git pull
# OR upload new files

# Install any new dependencies
npm install --production

# Rebuild
npm run build

# Restart application
pm2 restart careerroad

# Check status
pm2 status
pm2 logs careerroad
```

## 🛠️ Useful Commands

```bash
# PM2 Commands
pm2 status              # Check status
pm2 logs careerroad     # View logs
pm2 restart careerroad  # Restart app
pm2 stop careerroad     # Stop app
pm2 delete careerroad   # Remove from PM2
pm2 monit               # Monitor in real-time

# Nginx Commands
sudo nginx -t           # Test configuration
sudo systemctl status nginx  # Check status
sudo systemctl restart nginx # Restart
sudo systemctl reload nginx  # Reload config

# Application Logs
pm2 logs careerroad --lines 100  # Last 100 lines
tail -f ~/.pm2/logs/careerroad-out.log
tail -f ~/.pm2/logs/careerroad-err.log
```

## 🚨 Troubleshooting

### Application won't start
```bash
# Check PM2 logs
pm2 logs careerroad

# Check if port is in use
sudo lsof -i :5000

# Check environment variables
pm2 env 0
```

### Nginx 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check app logs
pm2 logs careerroad

# Verify Nginx can reach app
curl http://localhost:5000
```

### Database connection errors
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check environment variable
echo $DATABASE_URL
```

### Out of memory
```bash
# Check memory usage
free -h
pm2 monit

# Restart with more memory
pm2 restart careerroad --update-env
```

## 🔐 Security Checklist

- [ ] Security group only allows necessary ports
- [ ] SSH access restricted to your IP
- [ ] Strong SESSION_SECRET set
- [ ] HTTPS/SSL configured
- [ ] Environment variables secured
- [ ] Database credentials secure
- [ ] Regular security updates applied

## 📊 Performance Optimization

1. **Enable Gzip in Nginx:**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **Set up CloudWatch monitoring**
3. **Configure auto-scaling** (if needed)
4. **Use CDN** for static assets (CloudFront)

## 💰 Cost Optimization

- Use `t3.small` for small traffic
- Enable auto-shutdown for dev environments
- Use Reserved Instances for production
- Monitor and optimize data transfer

---

**Your application should now be live!** 🎉

Visit: `http://your-ec2-ip` or `https://your-domain.com`

