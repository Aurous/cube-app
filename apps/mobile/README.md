# Cube Timer Mobile App

This is the Expo/React Native mobile app for Cube Timer.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Expo CLI (installed globally or via npx)
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

### Installation

From the root of the monorepo:

```bash
npm install
```

### Running the App

```bash
# Start the Expo development server
npm run dev

# Or run from the mobile app directory
cd apps/mobile
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web (for testing)
npm run web
```

## Project Structure

```
apps/mobile/
├── app/              # Expo Router app directory
│   ├── _layout.tsx   # Root layout
│   ├── index.tsx     # Home screen
│   └── timer.tsx     # Timer screen
├── assets/           # Images and other assets
├── app.json          # Expo configuration
├── babel.config.js   # Babel configuration
├── metro.config.js   # Metro bundler configuration
└── package.json      # Dependencies

packages/
└── shared-platform/ # Shared platform abstractions
    └── src/
        ├── storage.ts    # Storage abstraction (localStorage/AsyncStorage)
        └── bluetooth.ts # Bluetooth abstraction (Web Bluetooth/react-native-ble-plx)
```

## Features

- **Platform Abstractions**: Shared code for storage and Bluetooth that works on both web and mobile
- **Expo Router**: File-based routing for navigation
- **React Native**: Native mobile components and APIs

## Development Notes

- The app uses Expo Router for navigation (similar to Next.js file-based routing)
- Platform-specific code is abstracted in `@cube-timer/shared-platform`
- Bluetooth functionality uses `react-native-ble-plx` for mobile devices
- Storage uses `@react-native-async-storage/async-storage` for mobile

## Building

```bash
# Build for production
npm run build

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```
