import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRoute } from '@react-navigation/native'

export default function SolveDetailScreen() {
  const route = useRoute()
  const { solveId } = route.params as { solveId: string }
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Solve Detail: {solveId}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 18,
  },
})
