# 🚀 KahveQR Netlify + Neon Deployment Guide

Bu döküman, KahveQR uygulamasını **Netlify** (frontend + serverless backend) ve **Neon PostgreSQL** (database) üzerinde deploy etmek için adım adım talimatlar içerir.

## 📋 Gereksinimler

- ✅ [GitHub](https://github.com) hesabı
- ✅ [Netlify](https://www.netlify.com) hesabı (ücretsiz)
- ✅ [Neon](https://neon.tech) hesabı (ücretsiz)
- ✅ Node.js 18+ yüklü

---

## 🗄️ Adım 1: Neon PostgreSQL Kurulumu

### 1.1. Neon'da Proje Oluştur

1. [Neon Console](https://console.neon.tech/) adresine git
2. **"Create Project"** butonuna tıkla
3. Proje adı: `kahveqr`
4. Region seç (örn: AWS Europe (Frankfurt))
5. **"Create Project"** ile oluştur

### 1.2. Connection String'i Kopyala

Proje oluşturulduktan sonra **Dashboard** > **Connection Details** bölümünden:
```
postgresql://[user]:[password]@[host].neon.tech/[dbname]?sslmode=require
```
Bu connection string'i kaydet, daha sonra lazım olacak.

### 1.3. Database Schema'yı Uygula

Lokal makinende:
```bash
# 1. .env dosyası oluştur ve Neon connection string'ini ekle
cp .env.example .env
# .env dosyasında DATABASE_URL'i düzenle

# 2. Prisma schema'yı Neon'a uygula
cd backend
npx prisma db push

# 3. Seed data ekle (demo veriler)
npx prisma db seed
# veya
npm run prisma:seed
```

---

## 🌐 Adım 2: GitHub Repository Hazırlama

### 2.1. Git Repository Oluştur

```bash
# Eğer henüz git başlatmadıysan:
git init
git add .
git commit -m "Initial commit: KahveQR with Netlify support"

# GitHub'da yeni repo oluştur ve push et:
git remote add origin https://github.com/YOUR_USERNAME/kahveqr.git
git branch -M main
git push -u origin main
```

### 2.2. `.gitignore` Kontrol

`.gitignore` dosyasında şunların olduğundan emin ol:
```
node_modules/
.env
.env.local
dist/
.netlify/
backend/node_modules/
backend/dist/
```

---

## 🚀 Adım 3: Netlify Deployment

### 3.1. Netlify'da Site Oluştur

1. [Netlify Dashboard](https://app.netlify.com/) adresine git
2. **"Add new site"** > **"Import an existing project"**
3. GitHub'ı seç ve `kahveqr` reposunu seç
4. Build ayarları otomatik algılanacak, kontrol et:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`

### 3.2. Environment Variables Ekle

Netlify Dashboard'da:
**Site Settings** > **Environment Variables** > **Add a variable**

Şu değişkenleri ekle:

```bash
DATABASE_URL = "postgresql://[user]:[password]@[host].neon.tech/[dbname]?sslmode=require"
JWT_SECRET = "random-secret-key-generate-new-one"
NODE_ENV = "production"
FRONTEND_URL = "https://your-site.netlify.app"  # Deploy sonrası güncellenecek
```

**JWT_SECRET oluşturmak için:**
```bash
# Terminal'de çalıştır:
openssl rand -base64 32
```

### 3.3. Deploy Et

1. **"Deploy site"** butonuna tıkla
2. Build loglarını izle (~2-3 dakika sürer)
3. Deploy başarılı olunca, site URL'ini kopyala (örn: `https://kahveqr.netlify.app`)

### 3.4. FRONTEND_URL'i Güncelle

1. Site URL'ini kopyala
2. **Site Settings** > **Environment Variables** > **FRONTEND_URL** değişkenini güncelle
3. **"Trigger deploy"** > **"Deploy site"** ile yeniden deploy et

---

## ✅ Adım 4: Test Et

### 4.1. Health Check

Tarayıcıda aç:
```
https://your-site.netlify.app/api/health
```

Şu response'u görmelisin:
```json
{
  "status": "OK",
  "message": "KahveQR API is running on Netlify",
  "timestamp": "2024-01-08T..."
}
```

### 4.2. Login Test

1. Ana sayfaya git: `https://your-site.netlify.app`
2. **"İşletme Girişi"** butonuna tıkla
3. Test hesaplarından biriyle giriş yap:
   - **Owner:** `mehmet@starbucks.com` / `123456`
   - **Manager:** `ayse.kadikoy@starbucks.com` / `123456`

### 4.3. Müşteri Uygulaması Test

1. Ana sayfada **"Müşteri Girişi"** seç
2. Yeni hesap oluştur veya demo hesapla giriş yap:
   - **Demo:** `demo@kahveqr.com` / `123456`

---

## 🔧 Sorun Giderme

### Problem: API 404 hatası

**Çözüm:**
1. `netlify.toml` dosyasının doğru olduğundan emin ol
2. Netlify Dashboard > **Functions** bölümünde `api` function'ının göründüğünü kontrol et
3. Site'ı yeniden deploy et

### Problem: Database connection hatası

**Çözüm:**
1. Neon Dashboard'da database'in **active** olduğunu kontrol et (idle olabilir)
2. Connection string'in doğru olduğunu doğrula
3. Neon'da **IP allowlist** ayarlarını kontrol et (Netlify IP'leri izin verilmiş olmalı)

### Problem: Prisma generate hatası

**Çözüm:**
Build command'ı güncelle:
```bash
# Netlify Dashboard > Site Settings > Build & deploy > Build settings
# Build command:
npm install && cd backend && npx prisma generate && cd .. && npm run build
```

### Problem: Cold start yavaşlığı

Bu normal! Netlify Functions ilk request'te ~1-2 saniye gecikme yapabilir.
**Çözüm:** Paid plan'de daha hızlıdır, ya da bir keep-alive service kullan.

---

## 📊 Netlify Functions Limitleri (Free Plan)

| Özellik | Limit |
|---------|-------|
| Invocations | 125K/ay |
| Function timeout | 10 saniye |
| Memory | 1024 MB |
| Background functions | Yok |

Daha fazla detay: [Netlify Pricing](https://www.netlify.com/pricing/)

---

## 🔄 Güncelleme ve Yeniden Deploy

### Otomatik Deploy

GitHub'a her push yaptığında Netlify otomatik deploy eder:
```bash
git add .
git commit -m "Update: yeni özellik"
git push
```

### Manuel Deploy

Netlify Dashboard'dan:
**Deploys** > **Trigger deploy** > **Deploy site**

---

## 🎯 Production Optimizasyonları

### 1. Custom Domain Ekle

Netlify Dashboard:
**Domain management** > **Add custom domain**

### 2. HTTPS Otomatik

Netlify otomatik SSL certificate sağlar (Let's Encrypt).

### 3. Performans İyileştirmeleri

- ✅ Netlify Edge CDN otomatik aktif
- ✅ Gzip compression otomatik
- ✅ Asset caching yapılandırıldı (`netlify.toml`)

### 4. Analytics Ekle

Netlify Analytics ($9/ay) veya Google Analytics entegre edebilirsin.

---

## 📞 Destek ve Sorunlar

- **Netlify Docs:** https://docs.netlify.com/
- **Neon Docs:** https://neon.tech/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

## 🎉 Tebrikler!

KahveQR uygulaması artık canlıda! 🚀☕

**Demo Hesaplar:**
- **İşletme (Owner):** mehmet@starbucks.com / 123456
- **İşletme (Manager):** ayse.kadikoy@starbucks.com / 123456
- **Müşteri:** demo@kahveqr.com / 123456

