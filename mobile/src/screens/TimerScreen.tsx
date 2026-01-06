import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useSolveSession } from '@/contexts/SolveSessionContext'

export default function TimerScreen() {
  const { timer } = useSolveSession()
  
  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>
        {formatTime(timer.time)}
      </Text>
    </View>
  )
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const centiseconds = Math.floor((ms % 1000) / 10)
  
  if (minutes > 0) {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }
  return `${seconds}.${centiseconds.toString().padStart(2, '0')}`
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  timerText: {
    fontSize: 72,
    color: '#fff',
    fontFamily: 'monospace',
  },
})
