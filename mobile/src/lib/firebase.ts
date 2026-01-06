// Firebase modules - will be available after native build
let auth: any = null
let firestore: any = null
let storage: any = null

try {
  auth = require('@react-native-firebase/auth').default
  firestore = require('@react-native-firebase/firestore').default
  storage = require('@react-native-firebase/storage').default
} catch (e) {
  console.warn('Firebase native modules not available - running in offline mode')
}

// Check if Firebase is configured
export const isOfflineMode = !auth || !firestore || !storage

export const db = firestore ? firestore() : null
export const authInstance = auth ? auth() : null
export const storageInstance = storage ? storage() : null

// For compatibility with web code
export { authInstance as auth, db, storageInstance as storage }

// Google provider is handled differently in React Native
export const googleProvider = null // Not needed for React Native Firebase
