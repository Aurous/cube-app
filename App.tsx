/**
 * Expo App Entry Point
 * This is the main entry point for the Expo mobile app
 */

import 'react-native-gesture-handler'
import { registerRootComponent } from 'expo'
import { StatusBar } from 'expo-status-bar'
import { StrictMode } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StyleSheet } from 'react-native'
import { AppRoot } from './src/AppRoot'
import { ThemeProvider } from './src/components/theme-provider'
import { AuthProvider } from './src/contexts/AuthContext'
import { ExperienceProvider } from './src/contexts/ExperienceContext'
import { AchievementsProvider } from './src/contexts/AchievementsContext'
import { GoalsProvider } from './src/contexts/GoalsContext'
import { ChangelogProvider } from './src/contexts/ChangelogContext'
import { SolveSessionProvider } from './src/contexts/SolveSessionContext'
import { ToastProvider } from './src/contexts/ToastContext'
import { NotificationProvider } from './src/contexts/NotificationContext'
import { ErrorBoundary } from './src/components/error-boundary'
import { ChangelogModal } from './src/components/changelog-modal'

function App() {
  return (
    <StrictMode>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <ErrorBoundary>
            <ThemeProvider defaultTheme="dark">
              <ToastProvider>
                <NotificationProvider>
                  <AuthProvider>
                    <ExperienceProvider>
                      <AchievementsProvider>
                        <GoalsProvider>
                          <ChangelogProvider>
                            <SolveSessionProvider>
                              <AppRoot />
                              <ChangelogModal />
                            </SolveSessionProvider>
                          </ChangelogProvider>
                        </GoalsProvider>
                      </AchievementsProvider>
                    </ExperienceProvider>
                  </AuthProvider>
                </NotificationProvider>
              </ToastProvider>
            </ThemeProvider>
            <StatusBar style="auto" />
          </ErrorBoundary>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </StrictMode>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default registerRootComponent(App)
