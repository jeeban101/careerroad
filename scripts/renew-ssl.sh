#!/bin/bash
# SSL Certificate Auto-Renewal Script for careeroad.pro
# This script renews Let's Encrypt certificates and restarts the Docker containers.
# 
# Usage: Run via crontab on the server
#   sudo crontab -e
#   0 3 1,15 * * /path/to/careerroad/scripts/renew-ssl.sh >> /var/log/certbot-renew.log 2>&1

set -e

COMPOSE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DOMAIN="careeroad.pro"

echo "=== SSL Renewal Check: $(date) ==="

# Attempt renewal (only renews if cert is near expiry)
certbot renew --standalone \
  --pre-hook "docker compose -f $COMPOSE_DIR/docker-compose.yml down" \
  --post-hook "docker compose -f $COMPOSE_DIR/docker-compose.yml up -d"

echo "=== Renewal check complete ==="
