import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { db, isOfflineMode } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { getLatestVersion, hasNewChangelog } from '@/lib/changelog'
import { storage } from '@/lib/storage'

const STORAGE_KEY = 'cube-changelog-state'

interface ChangelogContextType {
  isOpen: boolean
  hasUnread: boolean
  lastSeenVersion: string | null
  openChangelog: () => void
  closeChangelog: () => void
  markAsRead: () => Promise<void>
}

const ChangelogContext = createContext<ChangelogContextType | null>(null)

async function loadLocalState(): Promise<string | null> {
  try {
    const stored = await storage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.lastSeenVersion || null
    }
  } catch {
    console.error('Failed to load changelog state from storage')
  }
  return null
}

async function saveLocalState(lastSeenVersion: string) {
  try {
    await storage.setItem(STORAGE_KEY, JSON.stringify({ lastSeenVersion }))
  } catch {
    console.error('Failed to save changelog state to storage')
  }
}

export function ChangelogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [lastSeenVersion, setLastSeenVersion] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const isGuest = isOfflineMode || !user || !db

  useEffect(() => {
    if (isGuest) {
      loadLocalState().then((local) => {
        setLastSeenVersion(local)
        setLoading(false)
      })
      return
    }

    if (!db) {
      setLoading(false)
      return
    }

    // Use React Native Firebase Firestore
    const userDocRef = db.collection('users').doc(user!.uid)

    const unsubscribe = userDocRef.onSnapshot(
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setLastSeenVersion(data?.lastSeenChangelogVersion || null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error listening to changelog state:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, isGuest])

  const hasUnread = !loading && hasNewChangelog(lastSeenVersion)

  const openChangelog = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeChangelog = useCallback(() => {
    setIsOpen(false)
  }, [])

  const markAsRead = useCallback(async () => {
    const latestVersion = getLatestVersion()
    setLastSeenVersion(latestVersion)

    if (isGuest || !db) {
      await saveLocalState(latestVersion)
      return
    }

    try {
      const userDocRef = db.collection('users').doc(user!.uid)
      await userDocRef.update({
        lastSeenChangelogVersion: latestVersion,
      })
    } catch (error) {
      console.error('Failed to save changelog state:', error)
      await saveLocalState(latestVersion)
    }
  }, [user, isGuest, db])

  return (
    <ChangelogContext.Provider
      value={{
        isOpen,
        hasUnread,
        lastSeenVersion,
        openChangelog,
        closeChangelog,
        markAsRead,
      }}
    >
      {children}
    </ChangelogContext.Provider>
  )
}

export function useChangelog(): ChangelogContextType {
  const context = useContext(ChangelogContext)
  if (!context) {
    throw new Error('useChangelog must be used within a ChangelogProvider')
  }
  return context
}
