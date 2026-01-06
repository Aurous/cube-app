# Cube Timer Mobile App

This is the mobile version of the Cube Timer app, built with Expo and React Native.

## Setup Instructions

### Prerequisites

1. Install Node.js (v18 or later)
2. Install Expo CLI: `npm install -g expo-cli`
3. For iOS: Install Xcode and CocoaPods
4. For Android: Install Android Studio and set up Android SDK

### Installation

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. For iOS, install CocoaPods:
   ```bash
   cd ios && pod install && cd ..
   ```

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Add iOS and Android apps to your Firebase project
3. Download `GoogleService-Info.plist` for iOS and place it in `ios/`
4. Download `google-services.json` for Android and place it in `android/app/`
5. Follow the React Native Firebase setup guide: https://rnfirebase.io/

### Running the App

- **iOS Simulator**: `npm run ios`
- **Android Emulator**: `npm run android`
- **Expo Go**: `npm start` then scan QR code with Expo Go app

## What's Been Converted

### ✅ Completed

- Basic Expo project structure
- React Navigation setup (replacing React Router)
- Firebase setup for React Native
- AsyncStorage wrapper (replacing localStorage)
- Core contexts (Auth, SolveSession, Toast, Notification, Theme)
- Basic screen structure
- TypeScript configuration
- Utility libraries (cube-state, cube-faces, etc.)

### ⚠️ Needs Work

1. **Bluetooth Integration** (`useSmartCube.ts`)
   - Currently uses Web Bluetooth API
   - Needs conversion to `react-native-ble-manager`
   - Update cube protocol adapters to work with React Native BLE

2. **3D Cube Visualization** (`components/cube/`)
   - Currently uses React Three Fiber (web)
   - Needs conversion to `expo-three` (with compatible `three@^0.145.0`) or `react-native-3d`
   - Update RubiksCube component for React Native
   - Note: `expo-three` and `three.js` dependencies removed for now - add back when implementing 3D visualization

3. **Component Conversion**
   - All web components need conversion to React Native components
   - Replace `<div>`, `<button>`, etc. with `<View>`, `<TouchableOpacity>`, etc.
   - Replace Tailwind classes with StyleSheet or NativeWind

4. **Hooks**
   - `useSolves.ts` - Update to use React Native Firebase Firestore
   - `useSmartCube.ts` - Convert to React Native BLE
   - Other hooks may need minor adjustments

5. **UI Components**
   - Convert all components in `components/` directory
   - Replace web-specific libraries (framer-motion, lucide-react) with React Native alternatives
   - Implement proper mobile navigation patterns

6. **Styling**
   - Set up NativeWind properly or convert to StyleSheet
   - Ensure theme system works with React Native

## Key Differences from Web Version

1. **Navigation**: React Router → React Navigation
2. **Storage**: localStorage → AsyncStorage
3. **Firebase**: Web SDK → React Native Firebase
4. **Bluetooth**: Web Bluetooth API → react-native-ble-manager
5. **3D Graphics**: React Three Fiber → expo-three
6. **Styling**: Tailwind CSS → NativeWind or StyleSheet
7. **Components**: HTML elements → React Native components

## Next Steps

1. Convert `useSmartCube` hook to use React Native BLE
2. Implement 3D cube viewer with expo-three
3. Convert all UI components to React Native
4. Set up proper theming with NativeWind
5. Test Bluetooth connectivity with smart cubes
6. Test on physical devices (iOS and Android)
7. Add proper error handling and loading states
8. Optimize performance for mobile devices

## Notes

- The app structure follows the same patterns as the web version
- Most business logic (cube state, solving, etc.) is platform-agnostic and can be reused
- Focus on converting platform-specific code (UI, Bluetooth, storage)
