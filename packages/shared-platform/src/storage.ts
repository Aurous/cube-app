/**
 * Platform-agnostic storage abstraction
 * Web: uses localStorage
 * Mobile: uses AsyncStorage
 */

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

// Web implementation
class WebStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null
    }
    return window.localStorage.getItem(key)
  }

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    window.localStorage.setItem(key, value)
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    window.localStorage.removeItem(key)
  }
}

// Mobile implementation
class MobileStorageAdapter implements StorageAdapter {
  private asyncStorage: typeof import('@react-native-async-storage/async-storage').default | null = null

  private async getAsyncStorage() {
    if (!this.asyncStorage) {
      this.asyncStorage = (await import('@react-native-async-storage/async-storage')).default
    }
    return this.asyncStorage
  }

  async getItem(key: string): Promise<string | null> {
    const storage = await this.getAsyncStorage()
    return storage.getItem(key)
  }

  async setItem(key: string, value: string): Promise<void> {
    const storage = await this.getAsyncStorage()
    await storage.setItem(key, value)
  }

  async removeItem(key: string): Promise<void> {
    const storage = await this.getAsyncStorage()
    await storage.removeItem(key)
  }
}

// Platform detection
function isReactNative(): boolean {
  return typeof navigator !== 'undefined' && navigator.product === 'ReactNative'
}

// Export the appropriate adapter
export const storage: StorageAdapter = isReactNative()
  ? new MobileStorageAdapter()
  : new WebStorageAdapter()

// Convenience functions
export async function getItem(key: string): Promise<string | null> {
  return storage.getItem(key)
}

export async function setItem(key: string, value: string): Promise<void> {
  return storage.setItem(key, value)
}

export async function removeItem(key: string): Promise<void> {
  return storage.removeItem(key)
}
