# SSL Certificates for Development

This directory should contain SSL certificate files for HTTPS in development.

## Quick Start (Self-Signed Certificates)

### macOS/Linux

Run the following command from the project root:

```bash
mkdir -p certs && openssl req -x509 -newkey rsa:2048 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/CN=3.238.250.221"
```

### Windows (PowerShell)

```powershell
mkdir certs -Force
openssl req -x509 -newkey rsa:2048 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/CN=localhost"
```

## Files Expected

- `key.pem` - Private key
- `cert.pem` - Certificate

## Browser Warning

Self-signed certificates will show a browser warning. To proceed:

- **Chrome**: Click "Advanced" → "Proceed to localhost (unsafe)"
- **Firefox**: Click "Advanced" → "Accept the Risk and Continue"
- **Safari**: Click "Show Details" → "visit this website"

## Production Certificates

For production with a domain, use Let's Encrypt:

```bash
sudo certbot certonly --standalone -d yourdomain.com
```

Certificates will be at `/etc/letsencrypt/live/yourdomain.com/`

## Setup your domain

```shell
certbot certonly --standalone -d careeroad.pro -d www.careeroad.pro
```
