// Wrapper for React Native Firebase Storage
// Using dynamic import to handle missing modules gracefully

let storageInstance: any = null
let isAvailable = false

// Initialize storage module
import('@react-native-firebase/storage')
  .then((storageModule) => {
    storageInstance = storageModule.default()
    isAvailable = true
  })
  .catch(() => {
    console.warn('Firebase Storage native module not available')
  })

export const getStorage = () => storageInstance
export const isStorageAvailable = () => isAvailable
