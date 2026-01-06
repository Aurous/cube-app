import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      '@': path.resolve(import.meta.dirname, 'src'),
      'gan-web-bluetooth': path.resolve(
        import.meta.dirname,
        'node_modules/gan-web-bluetooth/src/index.ts',
      ),
      // Use web version of AppNavigator to avoid React Navigation imports
      '@/navigation/AppNavigator': path.resolve(
        import.meta.dirname,
        'src/navigation/AppNavigator.web.tsx',
      ),
      // Alias React Native internal modules to avoid errors
      'react-native/Libraries/Utilities/codegenNativeComponent': 'react-native-web',
      'react-native/Libraries/ReactNative/AppContainer': 'react-native-web',
    },
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.jsx', '.js'],
  },
  optimizeDeps: {
    // Exclude React Native packages from optimization since they're for mobile only
    // These will be handled by Metro bundler for mobile builds
    exclude: [
      'react-native',
      'react-native-safe-area-context',
      'react-native-screens',
      'react-native-gesture-handler',
      'react-native-reanimated',
      'react-native-svg',
      '@react-native-async-storage/async-storage',
      '@react-navigation/native',
      '@react-navigation/native-stack',
      '@react-navigation/bottom-tabs',
      'expo',
      'expo-router',
      'expo-constants',
      'expo-linking',
      'expo-status-bar',
      'expo-system-ui',
      'expo-blur',
      'nativewind',
      'lucide-react-native',
    ],
    // Include react-native-web for web builds
    include: ['react-native-web'],
    // Force esbuild to skip these during pre-bundling
    esbuildOptions: {
      plugins: [],
    },
  },
  // Skip dependency pre-bundling for React Native packages
  ssr: {
    noExternal: [],
    external: [
      'react-native',
      'react-native-safe-area-context',
      'react-native-screens',
      'react-native-gesture-handler',
      'react-native-reanimated',
      '@react-navigation/native',
      '@react-navigation/native-stack',
      '@react-navigation/bottom-tabs',
      'expo',
      'expo-router',
    ],
  },
  worker: {
    format: 'es',
  },
})
