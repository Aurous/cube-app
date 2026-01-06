# Expo Migration Guide

This document outlines the migration from a Vite-based React web app to an Expo mobile app.

## Overview

The app has been set up to support both web and mobile platforms. Key changes include:

1. **Expo Configuration**: Added `app.json`, `app.config.js`, `metro.config.js`, and `babel.config.js`
2. **Storage Abstraction**: Created `src/lib/storage.ts` to handle localStorage (web) and AsyncStorage (mobile)
3. **Platform Utilities**: Created `src/lib/platform.ts` for platform detection and cross-platform APIs
4. **Navigation**: Set up React Navigation for mobile while keeping react-router-dom for web
5. **Entry Point**: Created `App.tsx` as the Expo entry point

## Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS development, you'll need Xcode installed
3. For Android development, you'll need Android Studio installed

## Running the App

### Web (existing)
```bash
npm run dev
```

### Mobile
```bash
# Start Expo development server
npm run expo:start

# Run on iOS simulator
npm run expo:ios

# Run on Android emulator
npm run expo:android

# Run on web (Expo web)
npm run expo:web
```

## Key Migration Points

### 1. Storage
- Replace `localStorage.getItem()` with `getStorage().getItem()` (async)
- Replace `localStorage.setItem()` with `getStorage().setItem()` (async)
- For synchronous access on web, use `getItemSync()` and `setItemSync()`

### 2. Navigation
- Web: Continue using `react-router-dom` hooks (`useNavigate`, `useLocation`)
- Mobile: Use React Navigation hooks from `@react-navigation/native`
- Use the unified `useNavigation()` hook from `src/lib/navigation.ts` when possible

### 3. Platform Detection
- Use `isWeb` and `isReactNative` from `src/lib/platform.ts`
- Use `getWindow()` and `getDocument()` for safe access to DOM APIs

### 4. Styling
- The app uses Tailwind CSS which can work with NativeWind on mobile
- Some components may need React Native StyleSheet equivalents
- Consider using `react-native-web` for web compatibility

### 5. Three.js / React Three Fiber
- React Three Fiber doesn't work directly on React Native
- Options:
  - Use `expo-gl` with Three.js directly (complex)
  - Create a 2D representation for mobile
  - Use a different 3D library for React Native
  - Conditionally render 3D on web, 2D on mobile

### 6. Bluetooth
- Web: Continue using Web Bluetooth API
- Mobile: Need to implement using `expo-bluetooth` or `react-native-ble-manager`
- The cube protocol adapters will need mobile implementations

### 7. Firebase
- Firebase should work on both platforms
- May need to configure differently for React Native
- Check Firebase React Native documentation

## Remaining Tasks

1. **Update all localStorage usage** to use the storage abstraction
2. **Convert components** to use React Native components where needed
3. **Handle Three.js** - decide on approach for mobile 3D rendering
4. **Implement Bluetooth** for mobile platforms
5. **Test navigation** on both platforms
6. **Update styling** for mobile-specific layouts
7. **Handle keyboard events** differently on mobile
8. **Test Firebase** on mobile platform

## Platform-Specific Code

Use platform detection to conditionally load code:

```typescript
import { isWeb } from '@/lib/platform'

if (isWeb) {
  // Web-specific code
} else {
  // Mobile-specific code
}
```

Or use platform-specific imports:

```typescript
import { Platform } from 'react-native'

if (Platform.OS === 'web') {
  // Web code
} else {
  // Mobile code
}
```

## Testing

- Test on both iOS and Android devices/simulators
- Test web version still works
- Ensure data persistence works on both platforms
- Test Bluetooth connectivity on mobile devices
