// Wrapper for React Native Google Sign-In
// Using dynamic import to handle missing modules gracefully

type GoogleSigninType = {
  configure: (config: { webClientId: string }) => void
  hasPlayServices: (options: { showPlayServicesUpdateDialog: boolean }) => Promise<void>
  signIn: () => Promise<{ idToken: string }>
  signOut: () => Promise<void>
}

let GoogleSigninInstance: GoogleSigninType | null = null
let isAvailable = false

// Initialize Google Sign-In module
import('@react-native-google-signin/google-signin')
  .then((googleModule) => {
    GoogleSigninInstance = googleModule.GoogleSignin
    isAvailable = true
  })
  .catch(() => {
    console.warn('Google Sign-In native module not available')
  })

export const getGoogleSignin = () => GoogleSigninInstance
export const isGoogleSigninAvailable = () => isAvailable
