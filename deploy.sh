#!/bin/bash

# AWS EC2 Deployment Script for CareerRoad
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Starting CareerRoad deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please create .env file with production environment variables."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed!${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Error: Node.js version must be 18 or higher!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production

# Run type check
echo -e "${YELLOW}🔍 Running type check...${NC}"
npm run check || echo -e "${YELLOW}⚠️  Type check warnings (continuing...)${NC}"

# Build application
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

# Verify build
if [ ! -f "dist/index.js" ]; then
    echo -e "${RED}❌ Error: Build failed! dist/index.js not found.${NC}"
    exit 1
fi

if [ ! -d "dist/public" ]; then
    echo -e "${RED}❌ Error: Build failed! dist/public not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

# Check if PM2 is installed
if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}🔄 Restarting application with PM2...${NC}"
    
    # Stop existing process if running
    pm2 stop careerroad 2>/dev/null || true
    pm2 delete careerroad 2>/dev/null || true
    
    # Start with ecosystem config
    if [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
    else
        pm2 start dist/index.js --name careerroad
    fi
    
    # Save PM2 configuration
    pm2 save
    
    echo -e "${GREEN}✅ Application restarted with PM2${NC}"
    echo -e "${GREEN}📊 View logs: pm2 logs careerroad${NC}"
    echo -e "${GREEN}📈 View status: pm2 status${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 not found. Starting application directly...${NC}"
    echo -e "${YELLOW}💡 Install PM2: npm install -g pm2${NC}"
    echo -e "${YELLOW}💡 Then run: pm2 start dist/index.js --name careerroad${NC}"
fi

echo -e "${GREEN}🎉 Deployment complete!${NC}"

