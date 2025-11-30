# Deployment Guide - Siakad ITB YADIKA

Panduan lengkap untuk deployment aplikasi ke production.

## 📋 Checklist Pre-Deployment

### 1. Environment Variables

Pastikan semua environment variables sudah diset:

```env
# Required
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production

# Email (pilih salah satu)
EMAIL_SERVICE=gmail
EMAIL_USER=...
EMAIL_PASSWORD=...

# atau
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASSWORD=...

EMAIL_FROM=noreply@itbyadika.ac.id
```

### 2. Database

- [ ] Database production sudah setup
- [ ] Migrations sudah dijalankan: `npx prisma migrate deploy`
- [ ] Prisma client sudah di-generate: `npx prisma generate`
- [ ] Connection pooling sudah dikonfigurasi (untuk Supabase)

### 3. Security

- [ ] HTTPS enabled
- [ ] Secure cookies enabled (otomatis jika `NODE_ENV=production`)
- [ ] Environment variables tidak ter-expose
- [ ] Database credentials aman

### 4. Build

- [ ] Build berhasil tanpa error: `npm run build`
- [ ] Tidak ada TypeScript errors
- [ ] Tidak ada linting errors

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

#### Keuntungan:
- Zero-config deployment
- Automatic HTTPS
- CDN global
- Easy environment variables management
- Automatic deployments dari Git

#### Langkah-langkah:

1. **Push ke Git Repository**
   ```bash
   git add .
   git commit -m "Prepare for production"
   git push origin main
   ```

2. **Import ke Vercel**
   - Login ke [Vercel](https://vercel.com)
   - Klik "New Project"
   - Import repository dari GitHub/GitLab
   - Vercel akan auto-detect Next.js

3. **Configure Environment Variables**
   - Di Vercel dashboard, masuk ke Settings > Environment Variables
   - Tambahkan semua environment variables
   - Pastikan untuk Production, Preview, dan Development

4. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. **Deploy**
   - Klik "Deploy"
   - Tunggu build selesai
   - Aplikasi akan live di URL yang diberikan

6. **Setup Custom Domain** (Opsional)
   - Di Settings > Domains
   - Tambahkan custom domain
   - Follow DNS instructions

#### Database Migrations di Vercel

Karena Vercel tidak support long-running processes, jalankan migrations secara manual:

```bash
# Set environment variables locally
export DATABASE_URL="your-production-database-url"
export DIRECT_URL="your-production-direct-url"

# Run migrations
npx prisma migrate deploy
```

Atau gunakan Vercel CLI:

```bash
vercel env pull .env.production
npx prisma migrate deploy
```

### Option 2: Self-Hosted (VPS/Server)

#### Requirements:
- Node.js 18+
- PostgreSQL database
- Reverse proxy (Nginx/Apache)
- SSL certificate (Let's Encrypt)

#### Langkah-langkah:

1. **Setup Server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 (process manager)
   sudo npm install -g pm2
   ```

2. **Clone & Setup Project**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd layanan-siakad
   
   # Install dependencies
   npm install
   
   # Setup environment
   cp .env.example .env
   # Edit .env dengan production values
   nano .env
   
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate deploy
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

4. **Setup PM2**
   ```bash
   # Create PM2 ecosystem file
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'siakad',
       script: 'npm',
       args: 'start',
       cwd: '/path/to/layanan-siakad',
       instances: 2,
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
   EOF
   
   # Start with PM2
   pm2 start ecosystem.config.js
   
   # Save PM2 configuration
   pm2 save
   
   # Setup PM2 to start on boot
   pm2 startup
   ```

5. **Setup Nginx Reverse Proxy**
   ```bash
   sudo nano /etc/nginx/sites-available/siakad
   ```

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
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
   # Enable site
   sudo ln -s /etc/nginx/sites-available/siakad /etc/nginx/sites-enabled/
   
   # Test configuration
   sudo nginx -t
   
   # Restart Nginx
   sudo systemctl restart nginx
   ```

6. **Setup SSL dengan Let's Encrypt**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Get SSL certificate
   sudo certbot --nginx -d yourdomain.com
   
   # Auto-renewal (already configured by certbot)
   ```

7. **Monitor Application**
   ```bash
   # PM2 monitoring
   pm2 monit
   
   # View logs
   pm2 logs siakad
   ```

### Option 3: Docker

#### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DIRECT_URL=${DIRECT_URL}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
      - EMAIL_SERVICE=${EMAIL_SERVICE}
      - EMAIL_USER=${EMAIL_USER}
      - EMAIL_PASSWORD=${EMAIL_PASSWORD}
      - EMAIL_FROM=${EMAIL_FROM}
      - NODE_ENV=production
    restart: unless-stopped
```

#### Deploy

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 🔄 Update Deployment

### Vercel
- Push perubahan ke Git
- Vercel akan auto-deploy

### Self-Hosted
```bash
# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Run migrations (if any)
npx prisma migrate deploy

# Rebuild
npm run build

# Restart PM2
pm2 restart siakad
```

### Docker
```bash
# Rebuild and restart
docker-compose up -d --build
```

## 📊 Monitoring

### Health Check

Setup health check endpoint (opsional):

```typescript
// app/api/health/route.ts
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

### Logging

- **Vercel**: Logs tersedia di dashboard
- **PM2**: `pm2 logs siakad`
- **Docker**: `docker-compose logs -f`

### Error Tracking

Pertimbangkan untuk menggunakan:
- Sentry untuk error tracking
- LogRocket untuk session replay
- Datadog untuk monitoring

## 🔒 Security Checklist

- [ ] HTTPS enabled
- [ ] Secure cookies enabled
- [ ] Environment variables tidak ter-expose
- [ ] Database credentials aman
- [ ] Rate limiting (pertimbangkan untuk API routes)
- [ ] CORS configured (jika perlu)
- [ ] Input validation di semua endpoints
- [ ] SQL injection protection (Prisma sudah handle)
- [ ] XSS protection (Next.js default)
- [ ] CSRF protection (Next.js default dengan SameSite cookies)

## 🐛 Troubleshooting Production

### Application tidak start
- Cek environment variables
- Cek database connection
- Cek logs untuk error messages

### Database connection error
- Pastikan `DATABASE_URL` benar
- Pastikan database accessible dari server
- Cek firewall rules

### Email tidak terkirim
- Cek email configuration
- Cek SMTP credentials
- Cek firewall untuk port SMTP
- Test dengan email service provider

### Performance issues
- Enable caching
- Optimize database queries
- Use CDN for static assets
- Monitor database performance

## 📞 Support

Jika ada masalah saat deployment, hubungi tim development.

