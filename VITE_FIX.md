# Vite Configuration Fix

## Problem
Vite was trying to process React Native packages (like `react-native-safe-area-context` and `react-native-screens`) that are only meant for mobile builds. These packages import internal React Native modules that don't exist in the web context, causing build errors.

## Solution
1. **Created web-specific stub**: `src/navigation/AppNavigator.web.tsx` - A stub version that doesn't import React Navigation, used when building for web
2. **Updated Vite config**: Added alias to use the web version of AppNavigator and configured proper exclusions
3. **Updated Metro config**: Ensured Metro (mobile bundler) uses the regular `.tsx` file, not the `.web.tsx` version

## How It Works

### Web Build (Vite)
- Uses `AppNavigator.web.tsx` (stub, no React Navigation imports)
- Excludes React Native packages from optimization
- Uses `react-native-web` for React Native compatibility

### Mobile Build (Metro/Expo)
- Uses `AppNavigator.tsx` (full React Navigation implementation)
- Processes all React Native packages normally
- No web-specific code is included

## Files Changed
- `vite.config.ts` - Added alias and exclusions
- `src/navigation/AppNavigator.web.tsx` - Web stub (new file)
- `metro.config.js` - Ensured correct file resolution for mobile

## Testing
- Web build: `npm run dev` should now work without errors
- Mobile build: `npm run expo:start` should use the full React Navigation implementation
