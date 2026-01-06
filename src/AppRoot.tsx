/**
 * Mobile AppRoot - uses React Navigation
 * Web version is in AppRoot.web.tsx
 */

import { AppNavigator } from '@/navigation/AppNavigator'

export function AppRoot() {
  // On mobile, use React Navigation
  return <AppNavigator />
}
