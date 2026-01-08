# 🔐 Environment Variables

Bu dosya, KahveQR uygulaması için gerekli environment variable'ları açıklar.

## 📋 Gerekli Variables

### 1. DATABASE_URL (Zorunlu)
Neon PostgreSQL connection string'i.

**Örnek:**
```bash
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
```

**Nereden alınır:**
1. [Neon Console](https://console.neon.tech/) → Project Dashboard
2. **Connection Details** bölümünden kopyala

---

### 2. JWT_SECRET (Zorunlu)
JWT token'ları imzalamak için kullanılan secret key.

**Örnek:**
```bash
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

**Nasıl oluşturulur:**
```bash
# Terminal'de çalıştır:
openssl rand -base64 32
```

**⚠️ ÖNEMLİ:** Production'da güçlü, rastgele bir key kullan!

---

### 3. NODE_ENV (Opsiyonel)
Uygulama ortamını belirtir.

**Değerler:**
- `development` - Lokal development
- `production` - Production deployment

**Örnek:**
```bash
NODE_ENV="production"
```

---

### 4. FRONTEND_URL (Opsiyonel, CORS için)
Frontend uygulamasının URL'i. CORS ayarları için kullanılır.

**Örnek:**
```bash
# Development:
FRONTEND_URL="http://localhost:5173"

# Production:
FRONTEND_URL="https://kahveqr.netlify.app"
```

---

### 5. VITE_API_URL (Opsiyonel, Frontend için)
Frontend'in hangi API endpoint'ini kullanacağını belirtir.

**Örnek:**
```bash
# Development (otomatik algılanır):
VITE_API_URL="http://localhost:3001/api"

# Production (otomatik algılanır, boş bırakılabilir):
VITE_API_URL="/api"
```

**Not:** Boş bırakılırsa, otomatik algılama çalışır.

---

## 🛠️ Lokal Development Setup

### 1. .env Dosyası Oluştur

```bash
# Proje root dizininde:
touch .env
```

### 2. Environment Variables Ekle

`.env` dosyasını düzenle:
```bash
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
JWT_SECRET="generated-secret-key-here"
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

### 3. Backend .env Dosyası

Backend klasöründe de bir `.env` dosyası oluştur:
```bash
cd backend
touch .env
```

`backend/.env`:
```bash
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
JWT_SECRET="same-as-root-env-file"
NODE_ENV="development"
```

---

## 🚀 Netlify Production Setup

### Environment Variables Ekleme

1. [Netlify Dashboard](https://app.netlify.com/) → Site seç
2. **Site Settings** → **Environment Variables**
3. **Add a variable** ile ekle:

| Key | Value | Örnek |
|-----|-------|-------|
| `DATABASE_URL` | Neon connection string | `postgresql://...` |
| `JWT_SECRET` | Random secret key | `openssl rand -base64 32` |
| `NODE_ENV` | `production` | `production` |
| `FRONTEND_URL` | Site URL | `https://kahveqr.netlify.app` |

### Deploy Sonrası

1. Deploy tamamlandıktan sonra site URL'ini al
2. `FRONTEND_URL` değişkenini site URL'i ile güncelle
3. **Trigger deploy** ile yeniden deploy et

---

## 🔒 Güvenlik Notları

### ✅ YAPIN:
- Strong, random JWT_SECRET kullanın
- Production ve development için farklı database kullanın
- Environment variables'ı asla Git'e commit etmeyin
- Neon'da production database'i için backup ayarlayın

### ❌ YAPMAYIN:
- JWT_SECRET'i asla public repo'da paylaşmayın
- Production DATABASE_URL'ini asla loglamayın
- Default/zayıf secret key'ler kullanmayın
- .env dosyasını Git'e eklemeyin (`.gitignore`'da olmalı)

---

## 📝 .gitignore Kontrolü

`.gitignore` dosyasında şunların olduğundan emin olun:
```
.env
.env.local
.env.*.local
backend/.env
```

---

## ✅ Checklist

Development başlamadan önce:
- [ ] Neon PostgreSQL projesi oluşturuldu
- [ ] DATABASE_URL alındı
- [ ] JWT_SECRET oluşturuldu (güçlü)
- [ ] `.env` dosyası oluşturuldu (root ve backend)
- [ ] Environment variables `.gitignore`'da
- [ ] `npx prisma db push` çalıştırıldı
- [ ] `npm run prisma:seed` çalıştırıldı

Production deploy öncesi:
- [ ] Netlify hesabı oluşturuldu
- [ ] GitHub repo oluşturuldu ve push edildi
- [ ] Netlify'da environment variables eklendi
- [ ] Build başarılı
- [ ] Health check çalışıyor (`/api/health`)
- [ ] Login test edildi

---

## 🆘 Sorun Giderme

### "Invalid DATABASE_URL"
- Connection string formatını kontrol et
- Neon'da database'in active olduğunu doğrula

### "JWT verification failed"
- Frontend ve backend'de aynı JWT_SECRET kullanıldığından emin ol
- Token'ın expire olmadığını kontrol et

### "CORS error"
- FRONTEND_URL'in doğru olduğunu kontrol et
- Netlify'da environment variable güncel mi?

---

## 📞 Daha Fazla Bilgi

- **Netlify Environment Variables:** https://docs.netlify.com/environment-variables/overview/
- **Neon Connection String:** https://neon.tech/docs/connect/connection-string
- **Prisma Environment Variables:** https://www.prisma.io/docs/guides/development-environment/environment-variables

