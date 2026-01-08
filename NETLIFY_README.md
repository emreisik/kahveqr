# 🚀 Netlify + Neon Deployment - Hızlı Başlangıç

Bu proje **Netlify** (serverless) ve **Neon PostgreSQL** ile çalışacak şekilde yapılandırılmıştır.

## 📦 Kurulum

### 1. Dependencies Yükle
```bash
npm install
```

### 2. Backend Dependencies
```bash
cd backend
npm install
cd ..
```

## 🗄️ Database Setup (Neon)

### 1. Neon Projesi Oluştur
1. [Neon Console](https://console.neon.tech/) → **Create Project**
2. Connection string'i kopyala

### 2. Environment Variables
```bash
# Root dizinde .env oluştur
DATABASE_URL="postgresql://..."
JWT_SECRET="random-secret-key"
```

### 3. Database Schema Uygula
```bash
cd backend
npx prisma db push
npx prisma db seed
```

## 🌐 Lokal Development

### Frontend + Backend Birlikte
```bash
# Terminal 1 - Frontend (Vite)
npm run dev

# Terminal 2 - Backend (Express)
cd backend
npm run dev
```

**Frontend:** http://localhost:5173  
**Backend:** http://localhost:3001/api

## 🚀 Netlify'a Deploy

### Hızlı Deploy
```bash
# 1. GitHub'a push et
git add .
git commit -m "Ready for Netlify"
git push

# 2. Netlify Dashboard'da:
# - Import from GitHub
# - Environment variables ekle (DATABASE_URL, JWT_SECRET)
# - Deploy!
```

### Detaylı Adımlar
Tam deployment rehberi için: **[DEPLOYMENT.md](./DEPLOYMENT.md)** dosyasına bakın.

## 📁 Proje Yapısı

```
kahveqr/
├── src/                      # React Frontend
├── backend/
│   ├── src/                  # Express Backend
│   └── prisma/               # Database Schema
├── netlify/
│   └── functions/
│       └── api.ts            # Serverless API Wrapper
├── netlify.toml              # Netlify Config
└── DEPLOYMENT.md             # Deployment Guide
```

## 🔧 Önemli Dosyalar

- **`netlify.toml`** - Netlify build ve redirect ayarları
- **`netlify/functions/api.ts`** - Backend'i serverless function olarak wrap eder
- **`src/lib/api.ts`** - Frontend API client (otomatik production/dev detection)
- **`backend/prisma/schema.prisma`** - Database schema

## 🧪 Test

### Health Check
```bash
# Lokal:
curl http://localhost:3001/api/health

# Production:
curl https://your-site.netlify.app/api/health
```

### Demo Hesaplar
**İşletme (Owner):**
- Email: `mehmet@starbucks.com`
- Şifre: `123456`

**İşletme (Manager):**
- Email: `ayse.kadikoy@starbucks.com`
- Şifre: `123456`

**Müşteri:**
- Email: `demo@kahveqr.com`
- Şifre: `123456`

## 📊 Netlify Functions Info

- **Path:** `/.netlify/functions/api`
- **Redirects:** `/api/*` → `/.netlify/functions/api/*`
- **Timeout:** 10 seconds (free plan)
- **Memory:** 1024 MB

## 🔐 Environment Variables

Netlify Dashboard'da şu variables'ları ekleyin:

| Variable | Açıklama |
|----------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | JWT signing key (güçlü olmalı!) |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://your-site.netlify.app` |

Detaylı bilgi: **[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)**

## ⚠️ Known Issues

### Cold Start
İlk request yavaş olabilir (~1-2 saniye). Bu Netlify Functions'ın doğal davranışıdır.

### Timeout
Çok uzun işlemler 10 saniye timeout'a takılabilir (free plan limiti).

## 📚 Daha Fazla Bilgi

- **Full Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Environment Variables:** [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)
- **Netlify Docs:** https://docs.netlify.com/
- **Neon Docs:** https://neon.tech/docs

## 🎉 Hazır!

Artık Netlify + Neon ile çalışan bir full-stack app'iniz var! ☕🚀

