# ⚡ KahveQR - Quick Start Guide

## 🎯 5 Dakikada Başla

### 1️⃣ Backend Hazır! ✅

Backend zaten çalışıyor: **http://localhost:3001**

Test et:
```bash
curl http://localhost:3001/health
```

### 2️⃣ Frontend'i Başlat

```bash
# Eğer bağımlılıklar yüklü değilse
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda aç: **http://localhost:5173**

### 3️⃣ Demo Kullanım

1. **Profil** sekmesine git
2. **"Demo Login (Neon DB)"** butonuna tıkla
3. ✨ Artık online moddasınız!

### 4️⃣ Test Et

- Cüzdan sayfasında loyalty kartlarınızı görün
- Bir karta tıklayın
- "+1 Damga Ekle" ile damga ekleyin
- Aktivite geçmişini kontrol edin

---

## 🔄 Modlar

### 📴 Offline Mod (Varsayılan)
- Veriler: localStorage
- Hızlı ve basit
- İnternet gerektirmez

### 🌐 Online Mod  
- Veriler: Neon PostgreSQL
- Real-time sync
- Multi-device support

**Geçiş:** Profil → "Demo Login (Neon DB)"

---

## 🛠️ Faydalı Komutlar

### Backend
```bash
cd backend

# Veritabanını görüntüle
npm run prisma:studio

# Veritabanını sıfırla
npx prisma migrate reset
npm run prisma:seed
```

### Test API
```bash
# Tüm kafeleri listele
curl http://localhost:3001/api/cafes

# Demo login
curl -X POST http://localhost:3001/api/auth/demo
```

---

## 📚 Daha Fazla Bilgi

- **Detaylı Kurulum:** `SETUP.md`
- **Entegrasyon Bilgisi:** `INTEGRATION_COMPLETE.md`
- **Deployment:** `backend/DEPLOYMENT.md`
- **Backend API:** `backend/README.md`

---

## 🐛 Sorun Giderme

### Backend çalışmıyor
```bash
cd backend
npm run dev
```

### Frontend bağlanamıyor
.env dosyasını kontrol et:
```
VITE_API_URL=http://localhost:3001/api
```

### Veritabanı hatası
```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
```

---

## 🎉 Başarıyla Kuruldu!

**Backend:** ✅ Running on port 3001  
**Frontend:** ⏳ `npm run dev` ile başlatın  
**Database:** ✅ Neon PostgreSQL ready  
**Data:** ✅ 11 cafe, demo user seeded  

**Keyifli kodlamalar! ☕**

