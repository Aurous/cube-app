/**
 * Native/mobile-specific environment variable access
 * This is the default implementation used by Metro for mobile builds
 * For web builds, Vite will use env.web.ts instead
 */

export const getEnv = (key: string): string | undefined => {
  // On React Native/Expo, use process.env
  // For Expo, you can also use expo-constants to access app.config.ts extra values
  return process.env[key]
}

export const isDev = (): boolean => {
  // @ts-ignore - __DEV__ is available in React Native
  return typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development'
}
