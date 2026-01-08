# İşletme Sistemi - Tamamen Ayrık Mimari

## 📋 Genel Bakış

İşletme ve müşteri sistemleri artık **tamamen ayrı** tablolar ve auth sistemleri kullanıyor.

## 🗄️ Veritabanı Mimarisi

### 1. **User Tablosu** (Müşteriler)
```prisma
model User {
  id           String
  email        String?
  phone        String?
  name         String?
  passwordHash String?
  memberships  Membership[]
  activities   Activity[]
}
```

### 2. **BusinessUser Tablosu** (İşletme Çalışanları)
```prisma
model BusinessUser {
  id           String
  email        String
  name         String
  passwordHash String
  cafeId       String
  cafe         Cafe
}
```

### 3. **Cafe Tablosu**
```prisma
model Cafe {
  id              String
  name            String
  address         String?
  stampsRequired  Int
  rewardName      String
  memberships     Membership[]
  activities      Activity[]
  businessUsers   BusinessUser[]  // İşletme çalışanları
}
```

## 🔐 Authentication Sistemleri

### Müşteri Auth
- **Endpoint**: `POST /api/auth/login`
- **Endpoint**: `POST /api/auth/register`
- **Storage**: `kahveqr-user` (localStorage)
- **Token**: JWT token

### İşletme Auth (Tamamen Ayrı)
- **Endpoint**: `POST /api/business-auth/login`
- **Storage**: `kahveqr-business-user` (localStorage)
- **Token**: JWT token (aynı token sistem, farklı kullanıcı)

## 🚪 Giriş Sayfaları

### Müşteri Girişi
- **Route**: `/auth`
- **Component**: `AuthPage`
- **Fonksiyon**: `login()` ve `register()`

### İşletme Girişi
- **Route**: `/business-login`
- **Component**: `BusinessLoginPage`
- **Fonksiyon**: `businessLogin()`

## 📱 Test Hesapları

### İşletme Hesapları (Her kafe için)
```
Email: starbucks@kahveqr.com
Şifre: 123456

Email: kahvedünyası@kahveqr.com
Şifre: 123456

Email: espressolab@kahveqr.com
Şifre: 123456
```

### Müşteri Hesabı
```
Email: demo@kahveqr.com
Şifre: (kayıt olurken oluştur)
```

## 🔄 Akış

### Müşteri Akışı
1. Splash ekran → "Müşteri Girişi"
2. Login/Register
3. Wallet → QR kod göster
4. İşletmede taratma

### İşletme Akışı
1. Splash ekran → "İşletme Girişi"
2. Email/Şifre ile giriş
3. **Scanner** ekranı (otomatik kendi kafesi seçili)
4. Kamera ile QR tara VEYA Manuel gir
5. Damga ekle / Ödül kullan

## 📸 Kamera Özelliği

Scanner sayfasında:
- **Kamera Modu**: Gerçek zamanlı QR kod tarama
- **Manuel Mod**: QR kod verisini yapıştırma
- Otomatik arka kamera
- QR okunduğunda otomatik geçiş

## 🔒 Güvenlik

- ✅ İşletme ve müşteriler **tamamen ayrı tablolar**
- ✅ Farklı localStorage anahtarları
- ✅ Farklı API endpoint'leri
- ✅ Her işletme kullanıcısı sadece kendi kafesini görebilir
- ✅ JWT token ile korumalı tüm istekler

## 🛠️ Teknik Detaylar

### Frontend
- `businessLogin()` - İşletme girişi
- `login()` - Müşteri girişi
- `getCurrentBusinessUser()` - İşletme kullanıcı bilgisi
- `getCurrentUser()` - Müşteri bilgisi
- `isBusinessUser()` - İşletme kullanıcısı kontrolü

### Backend
- `/api/auth/*` - Müşteri auth
- `/api/business-auth/*` - İşletme auth
- Prisma ile ayrı tablolar

### Seed
```bash
npm run prisma:seed
```
- 1 demo müşteri hesabı
- 11 kafe
- 11 işletme hesabı (her kafe için 1)

