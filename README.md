# Cube Timer

A Rubik's cube timer application with support for smart cubes, statistics tracking, and solve analysis.

## Project Structure

This is a monorepo containing:

- **apps/web**: React web application (Vite)
- **apps/mobile**: Expo/React Native mobile application
- **packages/shared-platform**: Shared platform abstractions for web and mobile

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm 10.0.0

### Installation

```bash
npm install
```

### Development

```bash
# Run web app
npm run dev

# Or run specific app
cd apps/web && npm run dev
cd apps/mobile && npm run dev
```

## Mobile App (Expo)

The mobile app is built with Expo and React Native. See [apps/mobile/README.md](./apps/mobile/README.md) for more details.

### Running the Mobile App

```bash
cd apps/mobile
npm start
# Then press 'i' for iOS or 'a' for Android
```

## Web App

The web app is built with React, Vite, and TypeScript. It supports:
- Web Bluetooth for smart cube connections
- Firebase for cloud sync
- Three.js for 3D cube visualization

## Shared Packages

### `@cube-timer/shared-platform`

Platform abstractions for:
- **Storage**: localStorage (web) / AsyncStorage (mobile)
- **Bluetooth**: Web Bluetooth (web) / expo-bluetooth (mobile)

## Building

```bash
# Build all apps
npm run build

# Build specific app
cd apps/web && npm run build
cd apps/mobile && npm run build
```

## License

See [LICENSE](./LICENSE) file.
