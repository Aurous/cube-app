# Bluetooth Native Module Setup

## Current Status

You're seeing the warning: `BleManager constructor failed, native module not available`

This means the native module for `react-native-ble-plx` is not properly linked or the app hasn't been rebuilt with native code.

## Solution: Rebuild the App

The app **must be rebuilt** after adding native modules. Here's how:

### Step 1: Ensure Native Projects are Generated

```bash
cd apps/mobile
npx expo prebuild --clean
```

### Step 2: Rebuild the App (Choose your platform)

**For iOS:**
```bash
npm run ios
```

This will:
- Compile all native code including `react-native-ble-plx`
- Install CocoaPods dependencies
- Build the iOS app
- Launch in simulator or device

**For Android:**
```bash
npm run android
```

This will:
- Compile all native code including `react-native-ble-plx`
- Build the Android app
- Launch in emulator or device

### Step 3: Verify Native Module is Linked

After rebuilding, check that the native module is included:

**iOS:**
```bash
cd ios
pod install
# Check that react-native-ble-plx is in the Podfile.lock
grep -i "ble-plx" Podfile.lock
```

**Android:**
The module should be auto-linked. Check `android/app/build.gradle` for the dependency.

## Important Notes

1. **You CANNOT use Expo Go** - This app requires a development build because it uses native modules
2. **First build takes 5-10 minutes** - Compiling native code takes time
3. **Subsequent builds are faster** - Only rebuild when you add new native modules or change `app.json`

## Troubleshooting

### Still seeing the warning after rebuild?

1. **Clean build:**
   ```bash
   # iOS
   cd ios
   rm -rf build Pods Podfile.lock
   cd ..
   npx expo prebuild --clean
   npm run ios
   
   # Android
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```

2. **Check if module is in Podfile (iOS):**
   ```bash
   cd ios
   grep -i "ble-plx" Podfile
   ```

3. **Verify plugin is in app.json:**
   The `react-native-ble-plx` plugin should be listed in `app.json` under `plugins` (it is).

4. **Check React Native version:**
   Make sure you're using React Native 0.81.5 (required by Expo 54):
   ```bash
   npm ls react-native
   ```

## Current Behavior

Even with the warning, the app will:
- ✅ Load the WebView successfully
- ✅ Display kitsunecube.com
- ⚠️ Show errors when Bluetooth is requested (because native module isn't available)

After rebuilding, Bluetooth will work properly.
