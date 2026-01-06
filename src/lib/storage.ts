/**
 * Storage abstraction layer for cross-platform compatibility
 * Uses AsyncStorage on React Native, localStorage on web
 */

let storage: {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
} | null = null

// Initialize storage based on platform
if (typeof window !== 'undefined' && window.localStorage) {
  // Web platform - use localStorage
  storage = {
    getItem: async (key: string) => {
      try {
        return localStorage.getItem(key)
      } catch (e) {
        console.error('Failed to get item from localStorage:', e)
        return null
      }
    },
    setItem: async (key: string, value: string) => {
      try {
        localStorage.setItem(key, value)
      } catch (e) {
        console.error('Failed to set item in localStorage:', e)
      }
    },
    removeItem: async (key: string) => {
      try {
        localStorage.removeItem(key)
      } catch (e) {
        console.error('Failed to remove item from localStorage:', e)
      }
    },
  }
} else {
  // React Native platform - use AsyncStorage
  // This will be set when AsyncStorage is available
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default
    storage = {
      getItem: async (key: string) => {
        try {
          return await AsyncStorage.getItem(key)
        } catch (e) {
          console.error('Failed to get item from AsyncStorage:', e)
          return null
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          await AsyncStorage.setItem(key, value)
        } catch (e) {
          console.error('Failed to set item in AsyncStorage:', e)
        }
      },
      removeItem: async (key: string) => {
        try {
          await AsyncStorage.removeItem(key)
        } catch (e) {
          console.error('Failed to remove item from AsyncStorage:', e)
        }
      },
    }
  } catch (e) {
    // AsyncStorage not available yet, will be initialized later
    console.warn('AsyncStorage not available, using fallback')
  }
}

// Fallback storage if neither is available
if (!storage) {
  const fallbackStorage: Record<string, string> = {}
  storage = {
    getItem: async (key: string) => fallbackStorage[key] || null,
    setItem: async (key: string, value: string) => {
      fallbackStorage[key] = value
    },
    removeItem: async (key: string) => {
      delete fallbackStorage[key]
    },
  }
}

export const getStorage = () => {
  if (!storage) {
    // Try to initialize AsyncStorage if not already done
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default
      storage = {
        getItem: async (key: string) => {
          try {
            return await AsyncStorage.getItem(key)
          } catch (e) {
            console.error('Failed to get item from AsyncStorage:', e)
            return null
          }
        },
        setItem: async (key: string, value: string) => {
          try {
            await AsyncStorage.setItem(key, value)
          } catch (e) {
            console.error('Failed to set item in AsyncStorage:', e)
          }
        },
        removeItem: async (key: string) => {
          try {
            await AsyncStorage.removeItem(key)
          } catch (e) {
            console.error('Failed to remove item from AsyncStorage:', e)
          }
        },
      }
    } catch (e) {
      // Still not available
    }
  }
  return storage
}

// Synchronous API for backward compatibility (web only)
export const getItemSync = (key: string): string | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return localStorage.getItem(key)
    } catch (e) {
      console.error('Failed to get item from localStorage:', e)
      return null
    }
  }
  return null
}

export const setItemSync = (key: string, value: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(key, value)
    } catch (e) {
      console.error('Failed to set item in localStorage:', e)
    }
  }
}

export const removeItemSync = (key: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error('Failed to remove item from localStorage:', e)
    }
  }
}
