import 'react-native-gesture-handler'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StyleSheet } from 'react-native'
import { AuthProvider } from './src/contexts/AuthContext'
import { SolveSessionProvider } from './src/contexts/SolveSessionContext'
import { AchievementsProvider } from './src/contexts/AchievementsContext'
import { ExperienceProvider } from './src/contexts/ExperienceContext'
import { GoalsProvider } from './src/contexts/GoalsContext'
import { ChangelogProvider } from './src/contexts/ChangelogContext'
import { ToastProvider } from './src/contexts/ToastContext'
import { NotificationProvider } from './src/contexts/NotificationContext'
import { ThemeProvider } from './src/components/theme-provider'
import TimerScreen from './src/screens/TimerScreen'
import AccountScreen from './src/screens/AccountScreen'
import AchievementsScreen from './src/screens/AchievementsScreen'
import LeaderboardScreen from './src/screens/LeaderboardScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import SolveDetailScreen from './src/screens/SolveDetailScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#000' },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen name="Timer" component={TimerScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
      <Tab.Screen name="Achievements" component={AchievementsScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <NotificationProvider>
              <AuthProvider>
                <ExperienceProvider>
                  <AchievementsProvider>
                    <GoalsProvider>
                      <ChangelogProvider>
                        <SolveSessionProvider>
                          <NavigationContainer>
                            <Stack.Navigator screenOptions={{ headerShown: false }}>
                              <Stack.Screen name="Main" component={MainTabs} />
                              <Stack.Screen 
                                name="SolveDetail" 
                                component={SolveDetailScreen}
                                options={{ headerShown: true, title: 'Solve Details' }}
                              />
                            </Stack.Navigator>
                          </NavigationContainer>
                        </SolveSessionProvider>
                      </ChangelogProvider>
                    </GoalsProvider>
                  </AchievementsProvider>
                </ExperienceProvider>
              </AuthProvider>
            </NotificationProvider>
          </ToastProvider>
        </ThemeProvider>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
