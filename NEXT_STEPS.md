# Next Steps for Expo Migration

## Completed ✅

1. ✅ Expo project structure and configuration files
2. ✅ Storage abstraction layer (`src/lib/storage.ts`)
3. ✅ Platform utilities (`src/lib/platform.ts`)
4. ✅ React Navigation setup (`src/navigation/AppNavigator.tsx`)
5. ✅ Expo entry point (`App.tsx`)
6. ✅ Updated package.json with Expo dependencies
7. ✅ Metro and Babel configuration

## Immediate Next Steps

### 1. Install Dependencies
Run the following to install all the new Expo dependencies:
```bash
npm install
```

### 2. Update Storage Usage
The following files still use `localStorage` directly and need to be updated to use the storage abstraction:

- `src/hooks/useSolves.ts` - Update `loadLocalSolves()` and `saveLocalSolves()`
- `src/hooks/useSettings.ts` - Update `loadSettings()` and `saveSettings()`
- `src/contexts/GoalsContext.tsx` - Update `loadLocalGoals()` and `saveLocalGoals()`
- `src/contexts/ChangelogContext.tsx` - Update `loadLocalState()` and `saveLocalState()`
- `src/App.tsx` - Update `localStorage.getItem(MAC_ADDRESS_STORAGE_KEY)`

Example migration:
```typescript
// Before
const stored = localStorage.getItem(STORAGE_KEY)

// After
import { getStorage } from '@/lib/storage'
const storage = getStorage()
const stored = await storage.getItem(STORAGE_KEY)
```

### 3. Update Navigation Usage
Components using `react-router-dom` hooks need platform-aware navigation:

- `src/App.tsx` - Uses `useNavigate()` and `useLocation()`
- All page components that navigate

Use the unified `useNavigation()` hook from `src/lib/navigation.ts` or conditionally import based on platform.

### 4. Handle Three.js / React Three Fiber
React Three Fiber doesn't work on React Native. Options:

**Option A: Conditional Rendering**
- Keep 3D cube on web
- Create a 2D cube representation for mobile
- Use `isWeb` to conditionally render

**Option B: Use expo-gl with Three.js**
- More complex but allows 3D on mobile
- Requires significant refactoring

**Option C: Use react-native-svg for 2D**
- Simpler 2D representation
- Good performance on mobile

### 5. Bluetooth Implementation
Web Bluetooth API doesn't work on React Native. Need to:

1. Install Bluetooth library:
```bash
npm install react-native-ble-manager
# or
npx expo install expo-bluetooth
```

2. Update `src/lib/cube-protocols/` adapters:
   - `gan-adapter.ts`
   - `qiyi-adapter.ts`
   - `giiker-adapter.ts`
   - `moyu-adapter.ts`

3. Create platform-specific Bluetooth connection logic

### 6. Update Styling
The app uses Tailwind CSS. For mobile:

**Option A: NativeWind**
- Already added to dependencies
- Configure in `tailwind.config.js`
- Most Tailwind classes will work

**Option B: React Native StyleSheet**
- Convert Tailwind classes to StyleSheet
- More work but better performance

### 7. Update DOM APIs
Files using `window` and `document`:

- `src/AppRoot.tsx` - `window.location.pathname`
- `src/hooks/useSettings.ts` - `window.dispatchEvent`, `window.addEventListener`
- `src/contexts/NotificationContext.tsx` - `window.addEventListener`
- `src/hooks/useKeyboardShortcuts.ts` - `window.addEventListener`
- `src/components/about-modal.tsx` - `document.body.style`

Use platform utilities from `src/lib/platform.ts`:
- `getWindow()` and `getDocument()` for safe access
- `platformEvents` for cross-platform events

### 8. Update Firebase Configuration
Firebase should work on React Native but may need:
- Different initialization
- Platform-specific configuration
- Check `src/lib/firebase.ts`

### 9. Test on Devices
1. Test on iOS simulator
2. Test on Android emulator
3. Test on physical devices
4. Verify data persistence
5. Test Bluetooth connectivity

## Files That Need Updates

### High Priority
1. `src/hooks/useSolves.ts` - Storage
2. `src/hooks/useSettings.ts` - Storage + window events
3. `src/App.tsx` - Navigation + storage
4. `src/components/cube/index.tsx` - Three.js handling
5. `src/lib/cube-protocols/*` - Bluetooth

### Medium Priority
1. `src/contexts/GoalsContext.tsx` - Storage
2. `src/contexts/ChangelogContext.tsx` - Storage
3. `src/components/about-modal.tsx` - Document API
4. `src/hooks/useKeyboardShortcuts.ts` - Window events
5. `src/contexts/NotificationContext.tsx` - Window events

### Low Priority
1. All other components using Tailwind (will work with NativeWind)
2. Components using framer-motion (should work with react-native-reanimated)

## Testing Checklist

- [ ] App starts on iOS
- [ ] App starts on Android
- [ ] Navigation works
- [ ] Data persists (solves, settings)
- [ ] Firebase auth works
- [ ] Bluetooth connection works (if implemented)
- [ ] 3D cube renders (or 2D alternative)
- [ ] All screens accessible
- [ ] No console errors

## Notes

- The web version should continue to work as before
- Use platform detection (`isWeb`) to conditionally load code
- AsyncStorage is async, so storage operations need to be awaited
- React Navigation uses different patterns than react-router-dom
- Some web-specific features may need mobile alternatives
