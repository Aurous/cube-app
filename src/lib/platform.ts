/**
 * Platform detection and utilities for cross-platform compatibility
 */

export const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined'
export const isReactNative = !isWeb && typeof navigator !== 'undefined' && navigator.product === 'ReactNative'
export const isExpo = typeof global !== 'undefined' && global.expo !== undefined

/**
 * Platform-specific event emitter for settings changes
 */
class PlatformEventEmitter {
  private listeners: Map<string, Set<(data?: any) => void>> = new Map()

  addEventListener(event: string, handler: (data?: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)

    // On web, also listen to native events
    if (isWeb) {
      window.addEventListener(event, handler as EventListener)
    }
  }

  removeEventListener(event: string, handler: (data?: any) => void) {
    this.listeners.get(event)?.delete(handler)

    if (isWeb) {
      window.removeEventListener(event, handler as EventListener)
    }
  }

  dispatchEvent(event: string, data?: any) {
    // Call registered listeners
    this.listeners.get(event)?.forEach((handler) => handler(data))

    // On web, also dispatch native event
    if (isWeb) {
      const customEvent = new CustomEvent(event, { detail: data })
      window.dispatchEvent(customEvent)
    }
  }
}

export const platformEvents = new PlatformEventEmitter()

/**
 * Get window object (web only)
 */
export const getWindow = (): Window | null => {
  if (isWeb) {
    return window
  }
  return null
}

/**
 * Get document object (web only)
 */
export const getDocument = (): Document | null => {
  if (isWeb) {
    return document
  }
  return null
}

/**
 * Safe keyboard event handler wrapper
 */
export const createKeyboardHandler = (
  handler: (e: { key: string; ctrlKey: boolean; shiftKey: boolean; preventDefault: () => void }) => void,
) => {
  if (isWeb) {
    return (e: KeyboardEvent) => {
      handler({
        key: e.key,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        preventDefault: () => e.preventDefault(),
      })
    }
  }
  // On React Native, keyboard events are handled differently
  // This would need to be implemented with react-native-keyboard-event-listener or similar
  return () => {}
}
