import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { isOfflineMode, authInstance as auth } from '@/lib/firebase'
import { getGoogleSignin } from '@/lib/google-signin'

type FirebaseUser = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL?: string | null
  updateProfile?: (profile: { displayName?: string; photoURL?: string }) => Promise<void>
}


interface AuthContextType {
  user: FirebaseUser | null
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
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(!isOfflineMode)

  useEffect(() => {
    if (isOfflineMode || !auth) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setLoading(false), 0)
      return
    }

    // Configure Google Sign-In
    const GoogleSignin = getGoogleSignin()
    if (GoogleSignin) {
      GoogleSignin.configure({
        webClientId: '', // Add your web client ID from Firebase console
      })
    }

    const unsubscribe = auth.onAuthStateChanged((firebaseUser: {
      uid: string
      email: string | null
      displayName: string | null
      updateProfile?: (profile: { displayName?: string; photoURL?: string }) => Promise<void>
    } | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          updateProfile: firebaseUser.updateProfile?.bind(firebaseUser),
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    const GoogleSignin = getGoogleSignin()
    if (isOfflineMode || !auth || !GoogleSignin) {
      console.warn('Firebase not configured - running in offline mode')
      return
    }
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
      const { idToken } = await GoogleSignin.signIn()
      const googleCredential = auth.GoogleAuthProvider.credential(idToken)
      await auth.signInWithCredential(googleCredential)
    } catch (error) {
      console.error('Failed to sign in with Google:', error)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    if (isOfflineMode || !auth) {
      console.warn('Firebase not configured - running in offline mode')
      return
    }
    await auth.signInWithEmailAndPassword(email, password)
  }

  const registerWithEmail = async (email: string, password: string, displayName?: string) => {
    if (isOfflineMode || !auth) {
      console.warn('Firebase not configured - running in offline mode')
      return
    }
    const result = await auth.createUserWithEmailAndPassword(email, password)
    if (displayName && result.user && result.user.updateProfile) {
      await result.user.updateProfile({ displayName })
    }
  }

  const resetPassword = async (email: string) => {
    if (isOfflineMode || !auth) {
      console.warn('Firebase not configured - running in offline mode')
      return
    }
    await auth.sendPasswordResetEmail(email)
  }

  const logout = async () => {
    if (isOfflineMode || !auth) return
    try {
      await auth.signOut()
      const GoogleSignin = getGoogleSignin()
      if (GoogleSignin) {
        await GoogleSignin.signOut()
      }
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
