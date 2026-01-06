// Wrapper for React Native Firebase Firestore
// Using dynamic import to handle missing modules gracefully

let firestoreInstance: any = null
let isAvailable = false

// Initialize firestore module
import('@react-native-firebase/firestore')
  .then((firestoreModule) => {
    firestoreInstance = firestoreModule.default()
    isAvailable = true
  })
  .catch(() => {
    console.warn('Firebase Firestore native module not available')
  })

export const getDb = () => firestoreInstance
export const isFirestoreAvailable = () => isAvailable
