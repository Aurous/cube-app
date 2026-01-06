// Wrapper for React Native Firebase Auth
// Using dynamic import to handle missing modules gracefully

let authInstance: any = null
let isAvailable = false

// Initialize auth module
import('@react-native-firebase/auth')
  .then((authModule) => {
    authInstance = authModule.default()
    isAvailable = true
  })
  .catch(() => {
    console.warn('Firebase Auth native module not available')
  })

export const getAuth = () => authInstance
export const isAuthAvailable = () => isAvailable
