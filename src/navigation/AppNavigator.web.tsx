/**
 * Web stub for AppNavigator
 * This file is used when building for web to avoid importing React Navigation
 */

// On web, navigation is handled by react-router-dom in AppRoot
export function AppNavigator() {
  return null
}

export type RootStackParamList = {
  Landing: undefined
  App: undefined
  Privacy: undefined
  Terms: undefined
  Changelog: undefined
  Docs: undefined
  Solve: { solveId: string; userId?: string }
}

export type AppTabParamList = {
  Timer: undefined
  Account: undefined
  Achievements: undefined
  Leaderboard: undefined
  Simulator: undefined
  Settings: undefined
  FAQ: undefined
  Solve: { solveId: string; userId?: string }
}

export type NavigationProps<T extends keyof RootStackParamList> = any
export type TabNavigationProps<T extends keyof AppTabParamList> = any
