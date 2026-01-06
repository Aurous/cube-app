/**
 * Mobile stub for TimerApp
 * The web implementation using react-router-dom is in App.web.tsx
 * TODO: Implement full mobile version using React Navigation hooks
 */

import { View, Text, StyleSheet } from 'react-native'

export function TimerApp() {
  // Mobile stub - TODO: Implement full timer app for mobile
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Timer App</Text>
      <Text style={styles.subtext}>Mobile version coming soon</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  text: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtext: {
    color: '#666666',
    fontSize: 16,
  },
})

export { TimerApp as App }
