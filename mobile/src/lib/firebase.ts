// Firebase modules - will be available after native build
// Using dynamic imports to handle missing modules gracefully
import { getAuth, isAuthAvailable } from './firebase-auth'
import { getDb, isFirestoreAvailable } from './firebase-firestore'
import { getStorage, isStorageAvailable } from './firebase-storage'

// Check if Firebase is configured (functions to check availability)
export const isOfflineMode = !isAuthAvailable() || !isFirestoreAvailable() || !isStorageAvailable()

export const authInstance = getAuth()
export const db = getDb()
export const storageInstance = getStorage()

// For compatibility with web code
export { authInstance as auth, db, storageInstance as storage }

// Google provider is handled differently in React Native
export const googleProvider = null // Not needed for React Native Firebase
