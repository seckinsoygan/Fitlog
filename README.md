# FitLog - Kişisel Fitness Takip Uygulaması 💪

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.81.5-blue?logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-54.0-black?logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/Firebase-12.7-orange?logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript" alt="TypeScript" />
</p>

## 📱 Hakkında

FitLog, antrenmanlarınızı takip etmenizi, beslenme alışkanlıklarınızı izlemenizi ve fitness hedeflerinize ulaşmanızı sağlayan modern bir mobil uygulamadır. React Native ve Expo ile geliştirilmiş olup, hem iOS hem de Android platformlarında çalışır.

## ✨ Özellikler

### 🏋️ Antrenman Takibi
- Hazır antrenman şablonları
- Özelleştirilebilir egzersiz programları
- Set, tekrar ve ağırlık takibi
- Antrenman geçmişi ve istatistikler
- Dinlenme zamanlayıcısı

### 🍎 Beslenme Takibi
- Günlük kalori takibi
- Makro besin (protein, karbonhidrat, yağ) takibi
- Su tüketimi izleme
- Beslenme geçmişi görüntüleme
- Hızlı yemek ekleme

### 🏆 Başarılar ve Rozetler
- Motivasyon artırıcı rozet sistemi
- İlerleme bazlı ödüller
- Streak takibi

### 📊 İlerleme Takibi
- Haftalık/aylık istatistikler
- Görsel grafikler
- Kişisel rekorlar
- Vücut ölçüleri takibi

### 🔐 Kimlik Doğrulama
- E-posta/şifre ile giriş
- Google ile giriş
- Güvenli Firebase Authentication

## 🛠️ Teknolojiler

| Teknoloji | Açıklama |
|-----------|----------|
| **React Native** | Cross-platform mobil uygulama geliştirme |
| **Expo** | React Native geliştirme platformu |
| **TypeScript** | Tip güvenli JavaScript |
| **Firebase** | Backend servisleri (Auth, Firestore) |
| **Zustand** | State management |
| **React Navigation** | Sayfa yönlendirme |
| **Lucide Icons** | Modern ikon kütüphanesi |

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Expo CLI

### Adımlar

1. **Repoyu klonlayın:**
```bash
git clone https://github.com/seckinsoygan/fitlog.git
cd fitlog
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Firebase yapılandırması:**
   - Firebase Console'da yeni bir proje oluşturun
   - Authentication ve Firestore'u etkinleştirin
   - `src/config/firebase.ts` dosyasını kendi Firebase yapılandırmanızla güncelleyin

4. **Uygulamayı başlatın:**
```bash
# Web için
npm run web

# iOS için
npm run ios

# Android için
npm run android
```

## 🌐 Canlı Demo

**Web:** [https://fitlog-xi.vercel.app](https://fitlog-xi.vercel.app)

## 📱 Ekran Görüntüleri

| Dashboard | Antrenman | Beslenme | İlerleme |
|-----------|-----------|----------|----------|
| Ana ekran ve günlük özet | Antrenman şablonları ve takip | Kalori ve makro takibi | Haftalık istatistikler |

## 🏗️ Proje Yapısı

```
src/
├── components/
│   ├── atoms/        # Temel UI bileşenleri
│   ├── molecules/    # Birleşik bileşenler
│   └── organisms/    # Karmaşık bileşenler
├── screens/          # Uygulama ekranları
│   └── auth/         # Kimlik doğrulama ekranları
├── store/            # Zustand state yönetimi
├── navigation/       # React Navigation yapılandırması
├── theme/            # Renk ve stil tanımları
├── config/           # Firebase ve diğer yapılandırmalar
└── hooks/            # Custom React hooks
```

## 🔧 Yapılandırma

### Firebase
`src/config/firebase.ts` dosyasında Firebase yapılandırmanızı güncelleyin:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### EAS Build
APK veya AAB build almak için:

```bash
# Preview APK
npx eas build --platform android --profile preview

# Production AAB
npx eas build --platform android --profile production
```

## 🚀 Deploy

### Vercel (Web)
```bash
npx vercel --prod
```

### Google Play Store
1. EAS ile production build alın
2. Google Play Console'a AAB dosyasını yükleyin

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici

**Seckin Soygan**
- GitHub: [@seckinsoygan](https://github.com/seckinsoygan)

---

<p align="center">
  Made with ❤️ using React Native & Expo
</p>
