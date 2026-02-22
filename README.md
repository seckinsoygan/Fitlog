<p align="center">
  <img src="assets/icon.png" alt="FitLog Logo" width="120" height="120" style="border-radius: 24px;" />
</p>

<h1 align="center">FitLog</h1>

<p align="center">
  <strong>Your Personal Fitness Tracking Companion</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue?style=for-the-badge" alt="Platform" />
  <img src="https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
</p>

---

## 📱 About

**FitLog** is a premium, cross-platform fitness tracking application built with React Native and Expo. It helps users track their workouts, nutrition, water intake, and overall fitness progress — all within a beautifully designed dark-themed interface with neon green accents.

Whether you're a beginner or an advanced lifter, FitLog provides the tools you need to stay consistent and reach your fitness goals.

---

## ✨ Features

### 🏋️ Workout Tracking
- **Active Workout Sessions** — Start, track, and complete workouts in real-time
- **Rest Timer** — Built-in configurable rest timer with haptic feedback
- **Set Logging** — Log sets with weight, reps, and RPE tracking
- **Exercise Library** — 100+ pre-loaded exercises with detailed descriptions and muscle group targeting

### 📋 Workout Templates
- **Custom Templates** — Create and save reusable workout templates
- **Template Editor** — Drag-and-drop exercise ordering with customizable sets/reps
- **Quick Start** — Launch workouts instantly from saved templates

### 📅 Weekly Programs
- **Program Builder** — Design complete weekly training programs
- **Day-by-Day Planning** — Assign specific workouts to each day of the week
- **Swipe-to-Delete** — Intuitive gesture-based card management

### 📊 Progress Tracking
- **Visual Charts** — Track your strength gains over time with interactive charts
- **Statistics Dashboard** — Total workouts, volume, streak tracking, and personal records
- **Workout History** — Complete log of all past sessions with detailed breakdowns

### 🥗 Nutrition & Water
- **Calorie Tracking** — Log daily meals with macro breakdowns (protein, carbs, fats)
- **Water Intake** — Beautiful animated water tracker with daily goals
- **Nutrition Goals** — Set and monitor personalized nutrition targets

### 🏆 Achievements & Gamification
- **Achievement System** — Unlock badges and milestones as you progress
- **Streak Tracking** — Maintain workout streaks and build consistency
- **Level Progression** — Gain XP and level up your fitness journey

### 🔐 Authentication & Cloud Sync
- **Email/Password Auth** — Secure Firebase authentication
- **Apple Sign-In** — Native Apple authentication for iOS users
- **Cloud Sync** — All data synced across devices via Firebase Firestore

### 🎨 Premium UI/UX
- **Dark & Light Themes** — Beautiful dark mode with neon green (#D4FF00) accents
- **Smooth Animations** — React Native Reanimated powered micro-interactions
- **Responsive Design** — Runs natively on iOS, Android, and Web
- **Multi-Language** — Full support for English 🇬🇧 and Turkish 🇹🇷

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | [React Native](https://reactnative.dev/) 0.81 with [Expo](https://expo.dev/) SDK 54 |
| **Language** | [TypeScript](https://www.typescriptlang.org/) 5.9 |
| **Navigation** | [React Navigation](https://reactnavigation.org/) 7 (Stack + Bottom Tabs) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) 5 |
| **Backend / Auth** | [Firebase](https://firebase.google.com/) (Auth + Firestore) |
| **Database (Local)** | [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) |
| **Animations** | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) 4 |
| **Gestures** | [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) |
| **Icons** | [Lucide React Native](https://lucide.dev/) |
| **Charts** | [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit) |
| **Build & Deploy** | [EAS Build](https://docs.expo.dev/build/introduction/) |

---

## 🏗 Architecture

FitLog follows an **Atomic Design** component architecture with a unidirectional data flow:

```
┌──────────────────────────────────────────────────────┐
│                    App.tsx (Entry)                    │
│                         │                            │
│     ┌──────────────────────────────────────┐         │
│     │          Navigation Layer            │         │
│     │  Onboarding → Auth → TrainingStyle   │         │
│     │          → Main App Tabs             │         │
│     └──────────────────────────────────────┘         │
│                         │                            │
│   ┌─────────┬───────────┼───────────┬─────────┐      │
│   │ Home    │ Templates │ Progress  │Nutrition│      │
│   │ Screen  │ Screen    │ Screen    │ Screen  │      │
│   └─────────┴───────────┴───────────┴─────────┘      │
│                         │                            │
│     ┌──────────────────────────────────────┐         │
│     │      Zustand State Management        │         │
│     │  workoutStore │ nutritionStore │ ...  │         │
│     └──────────────────────────────────────┘         │
│                         │                            │
│     ┌──────────────────────────────────────┐         │
│     │        Firebase / SQLite             │         │
│     │     Cloud Sync + Local Storage       │         │
│     └──────────────────────────────────────┘         │
└──────────────────────────────────────────────────────┘
```

### Component Structure (Atomic Design)

```
components/
├── atoms/          # Button, Typography, NumberInput
├── molecules/      # StatCard, WorkoutCard, RestTimer, WaterTracker
├── organisms/      # WeeklyProgress, complex composed components
└── icons/          # Custom icon components
```

### State Management

Each feature domain has its own Zustand store with Firebase sync:

| Store | Purpose |
|-------|---------|
| `workoutStore` | Active workout session management |
| `workoutHistoryStore` | Completed workout history |
| `exerciseLibraryStore` | Exercise database and search |
| `nutritionStore` | Meal logging and calorie tracking |
| `waterStore` | Daily water intake tracking |
| `weeklyProgramStore` | Training program management |
| `achievementsStore` | Badges, XP, and milestones |
| `authStore` | Firebase authentication state |
| `userStore` | User profile and preferences |
| `themeStore` | Dark/light theme management |
| `languageStore` | i18n language selection |
| `onboardingStore` | Onboarding flow state |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/build/setup/) (for builds)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/seckinsoygan/Fitlog.git
cd Fitlog

# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Devices

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

### Building for Production

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS (App Store)
eas build --platform ios --profile production

# Build for Android (Play Store)
eas build --platform android --profile production

# Submit to App Store
eas submit --platform ios --latest
```

---

## 📂 Project Structure

```
fitlog-app/
├── App.tsx                    # Application entry point
├── index.ts                   # Expo entry registration
├── app.json                   # Expo configuration
├── eas.json                   # EAS Build profiles
├── assets/                    # App icons, splash screens
├── src/
│   ├── components/
│   │   ├── atoms/             # Button, Typography, NumberInput
│   │   ├── molecules/         # StatCard, WorkoutCard, RestTimer, Header
│   │   ├── organisms/         # WeeklyProgress, complex layouts
│   │   └── icons/             # Custom icon components
│   ├── screens/
│   │   ├── DashboardScreen    # Home dashboard with stats
│   │   ├── ActiveWorkoutScreen # Live workout tracking
│   │   ├── TemplatesScreen    # Workout template management
│   │   ├── ProgressScreen     # Charts and statistics
│   │   ├── NutritionScreen    # Calorie & macro tracking
│   │   ├── ExercisesScreen    # Exercise library browser
│   │   ├── HistoryScreen      # Workout history log
│   │   ├── WeeklyProgramScreen # Weekly program builder
│   │   ├── AchievementsScreen # Badges and milestones
│   │   ├── SettingsScreen     # App settings & preferences
│   │   ├── auth/              # Login, Register, ForgotPassword
│   │   └── onboarding/        # Onboarding & training style
│   ├── store/                 # Zustand state stores (13 stores)
│   ├── navigation/            # React Navigation setup
│   ├── hooks/                 # Custom hooks (useTimer, useColors, etc.)
│   ├── services/              # Firebase sync services
│   ├── config/                # Firebase configuration
│   ├── theme/                 # Colors, typography, spacing tokens
│   ├── i18n/                  # English & Turkish translations
│   ├── types/                 # TypeScript type definitions
│   └── data/                  # Static data and constants
├── web/                       # Web-specific entry point
├── landing-page/              # Marketing landing page
└── public/                    # Public static assets
```

---

## 🌍 Internationalization

FitLog supports multiple languages with a custom i18n system:

| Language | Status |
|----------|--------|
| 🇹🇷 Türkçe (Turkish) | ✅ Full support |
| 🇬🇧 English | ✅ Full support |

Language can be switched from Settings at any time.

---

## 🎨 Design System

FitLog uses a carefully crafted design system:

- **Primary Color**: `#D4FF00` (Neon Green/Lime)
- **Background**: `#09090B` (Deep Black)
- **Surface**: `#18181B` (Dark Gray)
- **Typography**: System fonts with carefully weighted hierarchy
- **Border Radius**: Consistent rounded corners for a modern feel
- **Spacing**: 4px grid system for harmonious layouts

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 👨‍💻 Author

**Seçkin Soygan**

- GitHub: [@seckinsoygan](https://github.com/seckinsoygan)

---

<p align="center">
  Built with ❤️ and 💪
</p>
