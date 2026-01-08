# 🚀 KahveQR Backend Deployment Guide

Backend'i production'a deploy etmek için kılavuz.

## Deployment Seçenekleri

### 1. Vercel (Önerilen - Kolay)

```bash
# Vercel CLI kur
npm i -g vercel

# Backend dizinine git
cd backend

# vercel.json oluştur (aşağıda)
# Deploy
vercel
```

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "JWT_SECRET": "@jwt-secret"
  }
}
```

Environment variables Vercel dashboard'dan ekleyin.

---

### 2. Railway (Kolay)

1. https://railway.app adresine git
2. "New Project" → "Deploy from GitHub repo"
3. Backend klasörünü seç
4. Environment variables ekle
5. Deploy

Railway otomatik olarak `npm start` komutunu çalıştırır.

---

### 3. Render (Ücretsiz Tier)

1. https://render.com adresine git
2. "New Web Service"
3. GitHub repo bağla
4. Settings:
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - Environment Variables ekle

---

### 4. AWS / DigitalOcean (Advanced)

**Gereksinimler:**
- Node.js 18+
- PM2 (process manager)
- Nginx (reverse proxy)

**Setup:**
```bash
# PM2 kur
npm install -g pm2

# Backend klasöründe
npm run build
pm2 start dist/index.js --name kahveqr-api

# Nginx config
server {
  listen 80;
  server_name api.kahveqr.com;
  
  location / {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

---

## Frontend Deployment

### Vercel (Önerilen)

```bash
# Root dizinde
vercel

# Environment variable ekle:
VITE_API_URL=https://your-backend.vercel.app/api
```

### Netlify

```bash
# netlify.toml oluştur
[build]
  command = "npm run build"
  publish = "dist"

# Environment variables Netlify dashboard'dan
VITE_API_URL=https://your-backend.herokuapp.com/api
```

---

## Production Checklist

- [ ] JWT_SECRET güçlü bir key ile değiştirildi
- [ ] CORS production domain'e göre ayarlandı
- [ ] Rate limiting eklendi
- [ ] Database backups aktif
- [ ] Monitoring kuruldu (Sentry, LogRocket)
- [ ] HTTPS aktif
- [ ] Environment variables güvenli

---

## Monitoring

### Prisma ile Database Monitoring

```typescript
// src/config/database.ts
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

### Health Check Endpoint

Zaten mevcut: `GET /health`

---

## Scaling

Neon PostgreSQL otomatik olarak scale eder.

Backend için:
- Vercel: Otomatik scaling
- Railway: Horizontal scaling (ayarlardan)
- AWS: Load balancer + Auto scaling group

