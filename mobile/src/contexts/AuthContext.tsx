import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import auth from '@react-native-firebase/auth'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { isOfflineMode } from '@/lib/firebase'

// Conditionally import native modules
type FirebaseAuthTypes = any


interface AuthContextType {
  user: FirebaseAuthTypes.User | null
  loading: boolean
  isOffline: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null)
  const [loading, setLoading] = useState(!isOfflineMode)

  useEffect(() => {
    if (isOfflineMode || !auth) {
      setLoading(false)
      return
    }

    // Configure Google Sign-In
    if (GoogleSignin) {
      GoogleSignin.configure({
        webClientId: '', // Add your web client ID from Firebase console
      })
    }

    const unsubscribe = auth().onAuthStateChanged((user: any) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    if (isOfflineMode || !auth || !GoogleSignin) {
      console.warn('Firebase not configured - running in offline mode')
      return
    }
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
      const { idToken } = await GoogleSignin.signIn()
      const googleCredential = auth.GoogleAuthProvider.credential(idToken)
      await auth().signInWithCredential(googleCredential)
    } catch (error) {
      console.error('Failed to sign in with Google:', error)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    if (isOfflineMode) {
      console.warn('Firebase not configured - running in offline mode')
      return
    }
    await auth().signInWithEmailAndPassword(email, password)
  }

  const registerWithEmail = async (email: string, password: string, displayName?: string) => {
    if (isOfflineMode) {
      console.warn('Firebase not configured - running in offline mode')
      return
    }
    const result = await auth().createUserWithEmailAndPassword(email, password)
    if (displayName && result.user) {
      await result.user.updateProfile({ displayName })
    }
  }

  const resetPassword = async (email: string) => {
    if (isOfflineMode) {
      console.warn('Firebase not configured - running in offline mode')
      return
    }
    await auth().sendPasswordResetEmail(email)
  }

  const logout = async () => {
    if (isOfflineMode) return
    try {
      await auth().signOut()
      await GoogleSignin.signOut()
    } catch (error) {
      console.error('Failed to sign out:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isOffline: isOfflineMode, 
      signInWithGoogle, 
      signInWithEmail,
      registerWithEmail,
      resetPassword,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
