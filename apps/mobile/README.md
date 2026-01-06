# Kitsune Cube Mobile App

A React Native mobile app built with Expo 54 that loads kitsunecube.com in a WebView and provides native Bluetooth support for smart cube connectivity.

## Features

- **WebView Integration**: Loads kitsunecube.com in a full-screen WebView
- **Native Bluetooth Bridge**: Intercepts Web Bluetooth API calls and uses native Bluetooth (react-native-ble-plx) to communicate with smart cubes
- **Seamless Integration**: The website works as-is, with Bluetooth functionality automatically bridged to native APIs

## Architecture

The app consists of three main components:

1. **WebView Component** (`App.tsx`): Main app component that loads the website
2. **Bluetooth Bridge Service** (`src/services/BluetoothBridge.ts`): Handles native Bluetooth operations
3. **JavaScript Injection** (`src/injections/bluetooth-bridge-string.ts`): Intercepts Web Bluetooth API calls in the WebView and forwards them to the native bridge

## How It Works

1. The WebView loads kitsunecube.com
2. A JavaScript bridge is injected into the WebView that intercepts `navigator.bluetooth` API calls
3. When the website tries to use Web Bluetooth, the bridge:
   - Captures the Bluetooth API calls
   - Sends them to the native app via `postMessage`
   - The native app uses `react-native-ble-plx` to perform the actual Bluetooth operations
   - Results are sent back to the WebView via injected JavaScript
4. The website receives the data as if it were using the standard Web Bluetooth API

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on your device:
   - iOS: `npm run ios`
   - Android: `npm run android`

## Permissions

The app requires Bluetooth permissions on both iOS and Android:

- **iOS**: Bluetooth permissions are configured in `app.json` under `ios.infoPlist`
- **Android**: Bluetooth permissions are configured in `app.json` under `android.permissions`

## Building

To build for production:

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## Notes

- The app automatically selects the first matching Bluetooth device found during scanning
- The bridge supports all standard Web Bluetooth API operations: connect, disconnect, read, write, and notifications
- Characteristic value changes are automatically forwarded to the website as notifications
