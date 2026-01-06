# Expo Mobile App Setup

This document describes the Expo mobile app setup for the Cube Timer application.

## Overview

The mobile app has been set up as an Expo application in `apps/mobile/`. It uses:

- **Expo SDK 54**: Latest stable Expo SDK
- **Expo Router**: File-based routing (similar to Next.js)
- **React Native**: For native mobile components
- **TypeScript**: For type safety

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router app directory
│   ├── _layout.tsx        # Root layout with navigation
│   ├── index.tsx         # Home screen
│   └── timer.tsx         # Timer screen (placeholder)
├── assets/                # Images, fonts, etc.
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
├── metro.config.js       # Metro bundler configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```

## Platform Abstractions

The app uses `@cube-timer/shared-platform` package for platform-agnostic APIs:

### Storage
- **Web**: Uses `localStorage`
- **Mobile**: Uses `@react-native-async-storage/async-storage`

### Bluetooth
- **Web**: Uses Web Bluetooth API
- **Mobile**: Uses `react-native-ble-plx` (needs implementation)

## Key Dependencies

- `expo-router`: File-based routing
- `react-native-ble-plx`: Bluetooth Low Energy support for smart cubes
- `@react-native-async-storage/async-storage`: Persistent storage
- `react-native-gesture-handler`: Gesture support
- `react-native-reanimated`: Animations
- `react-native-safe-area-context`: Safe area handling
- `firebase`: Backend services (same as web app)
- `cubing`: Cube algorithms and notation

## Running the App

### Development

```bash
cd apps/mobile
npm start
```

Then:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Press `w` to open in web browser
- Scan QR code with Expo Go app on your phone

### Platform-Specific

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Configuration

### App Configuration (`app.json`)

- **Name**: Cube Timer
- **Bundle ID**: `com.cubetimer.mobile`
- **Permissions**: Bluetooth (iOS and Android)
- **Orientation**: Portrait

### Bluetooth Permissions

The app requires Bluetooth permissions for smart cube connections:

- **iOS**: Configured in `infoPlist` with usage descriptions
- **Android**: Configured in `permissions` array

## Next Steps

To fully implement the mobile app, you'll need to:

1. **Implement Bluetooth Adapter**: Complete the mobile Bluetooth implementation in `packages/shared-platform/src/bluetooth.ts` using `react-native-ble-plx` APIs
2. **Port Components**: Adapt web components to React Native:
   - Replace HTML elements with React Native components
   - Replace CSS with StyleSheet
   - Replace Three.js with React Native 3D library (e.g., `react-native-3d` or `expo-gl`)
3. **Implement Navigation**: Complete the navigation structure with all screens
4. **Port Hooks**: Adapt web hooks to work with mobile APIs
5. **Testing**: Test on physical devices with smart cubes

## Known Limitations

- Bluetooth abstraction is a placeholder and needs full implementation
- 3D cube visualization needs a React Native alternative to Three.js
- Some web-specific features may need mobile alternatives
- Canvas confetti and other web-only libraries need mobile alternatives

## Building for Production

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Using Expo CLI

```bash
# Build for production
expo export

# Or use EAS Build
eas build
```

## Troubleshooting

### Dependency Conflicts

If you encounter peer dependency issues, you may need to use `--legacy-peer-deps`:

```bash
npm install --legacy-peer-deps
```

### Metro Bundler Issues

Clear cache:
```bash
npm start -- --clear
```

### TypeScript Errors

Ensure all shared packages are properly linked in the workspace.

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native Documentation](https://reactnative.dev/)
- [react-native-ble-plx Documentation](https://github.com/dotintent/react-native-ble-plx)
- [react-native-ble-plx Expo Guide](https://github.com/dotintent/react-native-ble-plx/wiki/Expo)
