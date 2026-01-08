# 🔐 KahveQR - QR Güvenlik Sistemi

## Güvenlik Önlemleri

### ✅ Uygulanmış Güvenlik Katmanları

#### **1. QR Zaman Aşımı (5 Dakika)**
```typescript
// Kullanıcı QR kodları 5 dakika geçerli
const qrAge = Date.now() - data.timestamp;
if (qrAge > 5 * 60 * 1000) {
  return error('QR kod süresi dolmuş');
}
```

**Neden?**
- Eski QR kodların kullanılmasını engeller
- Replay attack koruması
- QR sekmesi her açıldığında yeni timestamp

---

#### **2. Cooldown Sistemi (30 Saniye)**
```typescript
// Aynı kullanıcı 30 saniye içinde tekrar damga alamaz
if (lastStampAt) {
  const timeSinceLastStamp = Date.now() - lastStampAt;
  if (timeSinceLastStamp < 30000) {
    return error('Çok hızlı! 30 saniye bekleyin');
  }
}
```

**Neden?**
- Aynı QR'ın hızlıca farklı kafelerde kullanılmasını engeller
- Müşteri kafeden çıkana kadar beklemeli
- Fraud koruması

---

#### **3. JWT Authentication**
```typescript
// Tüm scan işlemleri JWT token gerektirir
Authorization: Bearer <token>
```

**Neden?**
- Sadece yetkili personel tarayabilir
- Her istek doğrulanır
- Token 30 gün geçerli

---

#### **4. Kullanıcı Başına Ayrı Üyelik**
```typescript
// Her kullanıcı her kafede ayrı üyeliğe sahip
userId + cafeId = unique membership
```

**Neden?**
- Kafeler arası damga transferi yok
- Her kafe kendi programını yönetir
- Kullanıcı her kafede ayrı ilerler

---

#### **5. Ödül QR'ı Zaman Sınırı (5 Dakika)**
```typescript
// Redemption QR'ları sadece 5 dakika geçerli
if (qrAge > 5 * 60 * 1000) {
  return error('QR süresi dolmuş');
}
```

**Neden?**
- Ödül QR'ları kopyalanamaz
- Screenshot koruması
- Gerçek zamanlı kullanım zorunlu

---

## 🛡️ Saldırı Senaryoları ve Korunma

### **Senaryo 1: Aynı QR'ı Çoklu Kafede Kullanma**

**Saldırı:**
```
1. Kullanıcı QR'ını kopyalar
2. Starbucks'ta taratır → +1 damga
3. Hemen Kahve Dünyası'na gider
4. Aynı QR'ı tekrar taratır → +1 damga
```

**Korunma:**
```
✅ Cooldown Sistemi (30 saniye)
- İlk taramadan 30 saniye geçmeden ikinci tarama reddedilir
- Hata: "Çok hızlı! 25 saniye sonra tekrar deneyin"
```

---

### **Senaryo 2: Eski QR Kodlarla Replay Attack**

**Saldırı:**
```
1. Kullanıcı QR'ını dün kopyaladı
2. Bugün aynı QR'ı kullanmaya çalışıyor
```

**Korunma:**
```
✅ Timestamp Kontrolü (5 dakika)
- 5 dakikadan eski QR'lar reddedilir
- Hata: "QR kod süresi dolmuş. Lütfen yenileyin."
```

---

### **Senaryo 3: Screenshot ile Ödül Kullanma**

**Saldırı:**
```
1. Kullanıcı ödül QR'ının screenshot'unu alır
2. Ödül kullandıktan sonra tekrar screenshot'u gösterir
```

**Korunma:**
```
✅ Redemption Timestamp + Database Check
- QR tarandığında membership güncellenir
- Aynı QR tekrar taranınca damga yetersiz olur
- Ödül QR'ı 5 dakika geçerli
```

---

### **Senaryo 4: Başka Kullanıcının QR'ını Kullanma**

**Saldırı:**
```
1. Kullanıcı A, kullanıcı B'nin QR'ını alır
2. B'nin QR'ı ile damga kazanmaya çalışır
```

**Korunma:**
```
✅ User ID Doğrulama
- QR'daki userId database ile eşleşir
- Her QR kullanıcıya özel
- Kopyalansa bile B'nin hesabına damga eklenir
```

---

### **Senaryo 5: Sahte QR Oluşturma**

**Saldırı:**
```
1. Kullanıcı sahte QR JSON'ı oluşturur
2. Geçersiz userId veya format kullanır
```

**Korunma:**
```
✅ Database Validation
- userId veritabanında kontrol edilir
- Olmayan kullanıcı için işlem yapılmaz
- JSON parse hatası yakalanır
```

---

## 📊 Güvenlik Parametreleri

### **Cooldown Süreleri**

```typescript
const STAMP_COOLDOWN = 30 * 1000;      // 30 saniye
const QR_VALIDITY = 5 * 60 * 1000;     // 5 dakika
const REDEMPTION_QR_VALIDITY = 5 * 60 * 1000; // 5 dakika
```

### **Production İçin Öneriler**

```typescript
// Daha güvenli production ayarları
const STAMP_COOLDOWN = 60 * 1000;      // 1 dakika
const QR_VALIDITY = 2 * 60 * 1000;     // 2 dakika
const REDEMPTION_QR_VALIDITY = 3 * 60 * 1000; // 3 dakika
const MAX_STAMPS_PER_DAY = 10;         // Günlük limit
```

---

## 🔍 Log ve Monitoring

### **Her Tarama Loglanır**

```typescript
// Activity tablosunda kayıt
{
  userId: "xxx",
  cafeId: "xxx",
  type: "earn",
  delta: 1,
  createdAt: timestamp
}
```

### **Şüpheli Aktivite Tespiti**

Production için eklenebilir:
```typescript
// Çok hızlı tarama
if (userStampsInLast5Minutes > 5) {
  flag_suspicious_activity();
}

// Farklı kafelerde aynı anda
if (multiple_cafes_same_minute) {
  flag_suspicious_activity();
}

// Günlük limit aşımı
if (user_stamps_today > MAX_STAMPS_PER_DAY) {
  block_user();
}
```

---

## ⚠️ Bilinen Sınırlamalar

### **Demo Modda:**
```
❌ Gerçek QR scanner yok (manuel copy-paste)
❌ IP bazlı rate limiting yok
❌ Device fingerprinting yok
❌ GPS location check yok
```

### **Production İçin Gerekli:**
```
✅ Kamera ile QR tarama
✅ IP rate limiting
✅ Device ID tracking
✅ Konum doğrulama (kafe yakınında mı?)
✅ Fraud detection algoritması
✅ Admin dashboard ile monitoring
```

---

## 🎯 Test Senaryoları

### **Test 1: Cooldown Kontrolü**
```bash
1. Starbucks'ta QR tara → ✅ Başarılı
2. Hemen tekrar tara → ❌ "30 saniye bekleyin"
3. 30 saniye sonra → ✅ Başarılı
```

### **Test 2: QR Zaman Aşımı**
```bash
1. QR kodunu kopyala
2. 6 dakika bekle
3. Tara → ❌ "QR süresi dolmuş"
4. QR sekmesini yenile ve tekrar kopyala
5. Tara → ✅ Başarılı
```

### **Test 3: Farklı Kafeler**
```bash
1. Starbucks'ta tara → ✅ Başarılı (1/10)
2. Hemen Kahve Dünyası'nda tara → ❌ "30 saniye bekleyin"
3. 30 saniye sonra Kahve Dünyası'nda → ✅ Başarılı (1/8)
```

### **Test 4: Ödül QR**
```bash
1. Kartı 10/10 tamamla
2. Ödül QR'ı kopyala
3. Tara → ✅ Ödül kullanıldı
4. Aynı QR'ı tekrar tara → ❌ "Yetersiz damga"
```

---

## 📈 İstatistikler (Tahmini)

```
🔒 Güvenlik Katmanı: 5 adet
⏱️ QR Geçerlilik: 5 dakika
🛑 Cooldown: 30 saniye
🔑 Authentication: JWT (30 gün)
📊 Activity Logging: ✅
🚨 Fraud Detection: Temel seviye
```

---

## 🎊 Sonuç

**KahveQR güvenli bir QR sistemi kullanıyor:**

✅ **Zaman aşımı** kontrolü  
✅ **Cooldown** sistemi  
✅ **JWT** authentication  
✅ **Database** validation  
✅ **Activity** logging  

**Aynı QR kod artık kısa sürede tekrar kullanılamıyor! 🔐**

