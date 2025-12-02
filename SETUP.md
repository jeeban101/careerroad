# Deployment and Docker Setup

This project is containerized with Docker (multi-stage build) and orchestrated with Docker Compose. The Express server serves both the API and the built Vite client (static files) from a single container on port 8005 by default.

Contents
- Prerequisites
- Environment configuration
- Running locally with Docker
- Deploying on AWS EC2 (with auto-install of Docker)
- Operating the service (logs, rebuild, restart)
- Notes on database migrations (Drizzle)
- Troubleshooting

## 1) Prerequisites

- A PostgreSQL database (e.g., Supabase). You will need a connection string (DATABASE_URL) and PG* vars if used.
- A Google Gemini API key.
- A Linux host with Docker + Docker Compose plugin (for EC2 see section 4).

## 2) Environment configuration

Copy the .env.example to .env and fill all required values:

- DATABASE_URL: Full Postgres connection URL
- GEMINI_API_KEY: Google AI Studio API key
- SESSION_SECRET: Random secure string
- NODE_ENV: Use production for deployment
- VITE_API_URL: URL your frontend will call (e.g., http://localhost:8005 or your domain)

Example:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=your_secure_random_string_here
NODE_ENV=production
VITE_API_URL=http://your-host-or-domain:8005

Notes:
- The container defaults to NODE_PORT=8005 (see server/index.ts). You can override with env.
- docker-compose.yml automatically loads .env.

## 3) Running locally with Docker

Build and start:
docker compose up -d --build

Visit:
http://localhost:8005

Stop:
docker compose down

View logs:
docker compose logs -f

Rebuild after changes:
docker compose up -d --build

## 4) Deploying on AWS EC2

4.1 Launch an EC2 instance
- Amazon Linux 2 / Amazon Linux 2023 / Ubuntu 20.04+ recommended.
- Open security group to allow inbound TCP 8005 (or set up a reverse proxy on port 80/443).

4.2 Install Docker + Compose on EC2
SSH into the instance and run:
curl -fsSL https://raw.githubusercontent.com/jeeban101/careerroad/main/scripts/install-docker-ec2.sh -o install-docker-ec2.sh
sudo bash install-docker-ec2.sh
newgrp docker
docker --version
docker compose version

4.3 Obtain the app source on EC2
Option A: Clone from Git
git clone https://github.com/jeeban101/careerroad.git
cd careerroad

Option B: Copy a release artifact or use your CI to deliver files here.

4.4 Configure environment
cp .env.example .env
# Edit .env with your production values

4.5 Build and run with Compose
docker compose up -d --build

Verify it is running:
docker compose ps
curl http://localhost:8005

If exposing directly, ensure security group allows 8005 and test:
http://EC2_PUBLIC_IP:8005

Production note:
- For internet-facing production, it is recommended to put a reverse proxy (e.g., Nginx, ALB) in front and terminate TLS (443).

## 5) Operating the service

- Check logs:
docker compose logs -f

- Restart (after env or code changes):
docker compose up -d --build

- Stop:
docker compose down

- Update app (pull latest and rebuild):
git pull
docker compose up -d --build

## 6) Database migrations (Drizzle)

This repository includes Drizzle and migrations, with the script:
npm run db:push

Because drizzle-kit is a devDependency and the production container installs only production dependencies, you have two common options:

Option A: Run migrations from your workstation (recommended)
- Ensure your local Node environment has dev dependencies installed (npm i)
- Ensure DATABASE_URL in .env points to your production DB
- Run:
npm run db:push

Option B: Run migrations in a one-off environment that has dev deps
- For example, use a separate CI/CD job or a temporary container/image that includes dev dependencies and runs npm run db:push against your production DATABASE_URL.
- Do not run this on every container start. Execute once per schema change.

## 7) Troubleshooting

- The site returns 404/blank page in production:
  - Ensure npm run build ran inside the image. The Dockerfile runs it during build.
  - Ensure dist/public exists. The server serves dist/public in production.

- Cannot connect to Postgres:
  - Verify DATABASE_URL is correct, with correct user/password/host and that the instance allows inbound connections from your EC2 (VPC/security groups/allowed IPs).
  - Check PGHOST/PGPORT/PGUSER/PGPASSWORD if used.

- Port not reachable from internet:
  - Confirm EC2 security group inbound rule for TCP 8005 (or set up a reverse proxy on 80/443).
  - Confirm any network firewalls or NACLs allow traffic.
  - Confirm docker-compose.yml maps 8005:8005 and that the app is listening on 0.0.0.0.

- Compose not found on EC2:
  - Re-run the installer script. The script installs Docker and the Compose v2 plugin if not available.
  - Check docker compose version.

Summary
- Build and run locally: docker compose up -d --build
- EC2: install Docker via scripts/install-docker-ec2.sh, configure .env, docker compose up -d --build
- App serves on port 8005 by default. Use a reverse proxy + TLS for production-grade deployments.
