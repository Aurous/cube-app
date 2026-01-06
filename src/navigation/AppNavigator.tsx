/**
 * React Navigation setup for Expo
 * Replaces react-router-dom for mobile navigation
 */

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { TimerApp } from '@/App'
import { AccountPage } from '@/components/account-page'
import { AchievementsPage } from '@/components/achievements-page'
import { LeaderboardPage } from '@/components/leaderboard-page'
import { Simulator } from '@/components/simulator'
import { SettingsPanel } from '@/components/settings-panel'
import { FAQPage } from '@/components/faq-page'
import { SolvePage } from '@/components/solve-page'
import { LandingPage } from '@/pages/LandingPage'
import { InProgressPage } from '@/pages/InProgressPage'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

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

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<AppTabParamList>()

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#333333',
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#666666',
      }}
    >
      <Tab.Screen name="Timer" component={TimerApp} />
      <Tab.Screen name="Account" component={AccountPage} />
      <Tab.Screen name="Achievements" component={AchievementsPage} />
      <Tab.Screen name="Leaderboard" component={LeaderboardPage} />
      <Tab.Screen name="Simulator" component={Simulator} />
      <Tab.Screen name="Settings" component={SettingsPanel} />
    </Tab.Navigator>
  )
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
        }}
      >
        <Stack.Screen name="Landing" component={LandingPage} />
        <Stack.Screen name="App" component={AppTabs} />
        <Stack.Screen name="Privacy" component={InProgressPage} />
        <Stack.Screen name="Terms" component={InProgressPage} />
        <Stack.Screen name="Changelog" component={InProgressPage} />
        <Stack.Screen name="Docs" component={InProgressPage} />
        <Stack.Screen name="Solve" component={SolvePage} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

// Export navigation types for use in components
export type NavigationProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>

export type TabNavigationProps<T extends keyof AppTabParamList> = NativeStackScreenProps<
  AppTabParamList,
  T
>
